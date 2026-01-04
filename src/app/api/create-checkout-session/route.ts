import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentType, amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prayforward.org';

    if (paymentType === 'subscription') {
      // Create subscription checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Pray It Forward - Monthly Support',
                description: 'Monthly support for Pray It Forward',
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: amount, // Already in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support?success=true`,
        cancel_url: `${baseUrl}/support?canceled=true`,
      });

      return NextResponse.json({ id: session.id, url: session.url });
    } else {
      // Create one-time payment checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Pray It Forward - Donation',
                description: 'One-time donation to support Pray It Forward',
              },
              unit_amount: amount, // Already in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support?success=true`,
        cancel_url: `${baseUrl}/support?canceled=true`,
      });

      return NextResponse.json({ id: session.id, url: session.url });
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

