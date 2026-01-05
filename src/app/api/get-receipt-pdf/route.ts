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
    const { receiptId, receiptType, invoiceId: providedInvoiceId } = await request.json();

    if (!receiptId || !receiptType) {
      return NextResponse.json(
        { error: 'Missing receiptId or receiptType' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    let invoiceId: string | null = providedInvoiceId || null;

    // If invoice ID was provided, use it directly
    if (invoiceId) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const pdfUrl = invoice.invoice_pdf;

        if (!pdfUrl) {
          return NextResponse.json(
            { error: 'No PDF available for this receipt' },
            { status: 404 }
          );
        }

        return NextResponse.json({ pdfUrl });
      } catch {
        // Fall through to try finding invoice
      }
    }

    if (receiptType === 'subscription') {
      // For subscriptions, receiptId might be an invoice ID or subscription ID
      // Try to get the invoice
      try {
        const invoice = await stripe.invoices.retrieve(receiptId);
        invoiceId = invoice.id;
      } catch {
        // If receiptId is a subscription ID, get the latest invoice
        try {
          const invoices = await stripe.invoices.list({
            subscription: receiptId,
            limit: 1,
          });
          if (invoices.data.length > 0) {
            invoiceId = invoices.data[0].id;
          }
        } catch {
          // Try as a charge ID to find the invoice
          try {
            const charge = await stripe.charges.retrieve(receiptId);
            if (charge.invoice) {
              invoiceId = typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.id;
            }
          } catch {
            return NextResponse.json(
              { error: 'Could not find invoice for this receipt' },
              { status: 404 }
            );
          }
        }
      }
    } else {
      // For one-time payments, try to find the invoice from the charge
      try {
        const charge = await stripe.charges.retrieve(receiptId);
        if (charge.invoice) {
          invoiceId = typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.id;
        } else {
          // If no invoice, try to get from payment intent
          if (charge.payment_intent) {
            const paymentIntent = typeof charge.payment_intent === 'string' 
              ? await stripe.paymentIntents.retrieve(charge.payment_intent)
              : charge.payment_intent;
            
            if (paymentIntent.invoice) {
              invoiceId = typeof paymentIntent.invoice === 'string' 
                ? paymentIntent.invoice 
                : paymentIntent.invoice.id;
            }
          }
        }
      } catch {
        // Try as a checkout session
        try {
          const session = await stripe.checkout.sessions.retrieve(receiptId);
          if (session.invoice) {
            invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice.id;
          } else if (session.payment_intent) {
            const paymentIntent = typeof session.payment_intent === 'string'
              ? await stripe.paymentIntents.retrieve(session.payment_intent)
              : session.payment_intent;
            
            if (paymentIntent.invoice) {
              invoiceId = typeof paymentIntent.invoice === 'string'
                ? paymentIntent.invoice
                : paymentIntent.invoice.id;
            }
          }
        } catch {
          return NextResponse.json(
            { error: 'Could not find invoice for this receipt' },
            { status: 404 }
          );
        }
      }
    }

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Could not find invoice for this receipt' },
        { status: 404 }
      );
    }

    // Get the invoice PDF URL
    const invoice = await stripe.invoices.retrieve(invoiceId);
    const pdfUrl = invoice.invoice_pdf;

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'No PDF available for this receipt' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pdfUrl });
  } catch (error: any) {
    console.error('Error getting receipt PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get receipt PDF' },
      { status: 500 }
    );
  }
}

