import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );
  
  if (Object.keys(serviceAccount).length > 0) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
}

const getStripe = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });
};

const stripe = getStripe();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle successful payment events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const paymentType = session.metadata?.paymentType as 'one-time' | 'subscription' | undefined;

      if (userId && paymentType && session.amount_total) {
        // Use client-side Firestore if Admin SDK is not available
        // Otherwise, we'll need to use a Firebase Function for this
        // For now, we'll log it and the client can fetch from Stripe
        console.log('Payment completed:', {
          userId,
          paymentType,
          amount: session.amount_total,
          sessionId: session.id,
        });

        // Note: To store in Firestore server-side, you'll need Firebase Admin SDK
        // For now, we can create a client-side API route that stores this
        // Or use a Firebase Function triggered by this webhook
      }
    }

    // Handle subscription events
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;
      
      // Fetch subscription to get metadata
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;

      if (userId && invoice.amount_paid) {
        console.log('Subscription payment succeeded:', {
          userId,
          amount: invoice.amount_paid,
          invoiceId: invoice.id,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

