import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const receipts: any[] = [];
    const activeSubscriptions: any[] = [];

    // Fetch checkout sessions for this user
    // We'll search by customer email since we store userId in metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    });

    // Filter sessions by userId in metadata
    const userSessions = sessions.data.filter(
      (session) => session.metadata?.userId === userId
    );

    // Also search by customer email as fallback
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 100,
    });

    for (const customer of customers.data) {
      // Get subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100,
        status: 'all', // Get all subscriptions (active, canceled, etc.)
      });

      for (const subscription of subscriptions.data) {
        // Add active subscriptions to separate array
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const price = subscription.items.data[0]?.price;
          activeSubscriptions.push({
            id: subscription.id,
            subscriptionId: subscription.id,
            amount: price?.unit_amount || 0,
            status: subscription.status,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }

        // Get invoices for this subscription
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 100,
        });

        for (const invoice of invoices.data) {
          if (invoice.status === 'paid' && invoice.amount_paid) {
            receipts.push({
              id: invoice.id,
              amount: invoice.amount_paid,
              type: 'subscription',
              date: new Date(invoice.created * 1000).toISOString(),
              stripeSessionId: ('subscription' in invoice && invoice.subscription) ? (typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as any).id) : undefined,
              subscriptionId: subscription.id,
              status: invoice.status,
              invoiceId: invoice.id, // Invoice ID for PDF download
            });
          }
        }
      }

      // Get one-time payments
      const charges = await stripe.charges.list({
        customer: customer.id,
        limit: 100,
      });

      for (const charge of charges.data) {
        if (charge.paid && charge.amount) {
          receipts.push({
            id: charge.id,
            amount: charge.amount,
            type: 'one-time',
            date: new Date(charge.created * 1000).toISOString(),
            stripeSessionId: charge.payment_intent,
            status: charge.status,
            invoiceId: ('invoice' in charge && charge.invoice) ? (typeof charge.invoice === 'string' ? charge.invoice : (charge.invoice as any).id) : undefined,
          });
        }
      }
    }

    // Add sessions that have userId in metadata
    for (const session of userSessions) {
      if (session.payment_status === 'paid' && session.amount_total) {
        let invoiceId: string | undefined;
        
        // Try to get invoice ID from session
        if (session.invoice) {
          invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice.id;
        } else if (session.payment_intent) {
          // Try to get invoice from payment intent
          try {
            const paymentIntent = typeof session.payment_intent === 'string'
              ? await stripe.paymentIntents.retrieve(session.payment_intent)
              : session.payment_intent;
            
            if ('invoice' in paymentIntent && paymentIntent.invoice) {
              invoiceId = typeof paymentIntent.invoice === 'string'
                ? paymentIntent.invoice
                : (paymentIntent.invoice as any).id;
            }
          } catch {
            // Ignore errors
          }
        }
        
        receipts.push({
          id: session.id,
          amount: session.amount_total,
          type: session.mode === 'subscription' ? 'subscription' : 'one-time',
          date: new Date(session.created * 1000).toISOString(),
          stripeSessionId: session.id,
          status: session.payment_status,
          invoiceId,
        });
      }
    }

    // Sort by date (newest first) - convert to Date for sorting
    receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ receipts, activeSubscriptions });
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

