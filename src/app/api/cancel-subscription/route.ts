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
    const { subscriptionId, userEmail } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing userEmail' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Retrieve the subscription to verify it exists and belongs to the user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Verify the subscription belongs to a customer with this email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (customer && !customer.deleted && 'email' in customer && customer.email !== userEmail) {
      return NextResponse.json(
        { error: 'Subscription does not belong to this user' },
        { status: 403 }
      );
    }

    // Cancel the subscription at the end of the current period
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date((canceledSubscription as any).current_period_end * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

