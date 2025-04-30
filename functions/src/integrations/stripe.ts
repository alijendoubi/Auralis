import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2023-10-16'
});

// Create Express router
export const stripeRoutes = express.Router();

// Create a subscription for a therapist
stripeRoutes.post('/create-subscription', async (req, res) => {
  try {
    const { userId, plan, paymentMethodId } = req.body;
    
    if (!userId || !plan || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get user document
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userDoc.data()!;
    
    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || undefined,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      
      customerId = customer.id;
      
      // Update user document with Stripe customer ID
      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: customerId
      });
    } else {
      // Update existing customer's payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
      
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }
    
    // Get price ID for the selected plan
    let priceId;
    switch (plan) {
      case 'basic':
        priceId = functions.config().stripe.prices.basic;
        break;
      case 'professional':
        priceId = functions.config().stripe.prices.professional;
        break;
      case 'enterprise':
        priceId = functions.config().stripe.prices.enterprise;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.payment_intent']
    });
    
    // Save subscription details to Firestore
    await admin.firestore().collection('subscriptions').doc(userId).set({
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCustomerId: customerId,
      plan,
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
      currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return subscription details
    return res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel a subscription
stripeRoutes.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get subscription document
    const subscriptionDoc = await admin.firestore().collection('subscriptions').doc(userId).get();
    
    if (!subscriptionDoc.exists) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const subscription = subscriptionDoc.data()!;
    
    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    
    // Update subscription status in Firestore
    await admin.firestore().collection('subscriptions').doc(userId).update({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Update a subscription
stripeRoutes.post('/update-subscription', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    
    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get subscription document
    const subscriptionDoc = await admin.firestore().collection('subscriptions').doc(userId).get();
    
    if (!subscriptionDoc.exists) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const subscription = subscriptionDoc.data()!;
    
    // Get price ID for the selected plan
    let priceId;
    switch (plan) {
      case 'basic':
        priceId = functions.config().stripe.prices.basic;
        break;
      case 'professional':
        priceId = functions.config().stripe.prices.professional;
        break;
      case 'enterprise':
        priceId = functions.config().stripe.prices.enterprise;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Update subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: updatedSubscription.items.data[0].id,
          price: priceId
        }
      ]
    });
    
    // Update subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(userId).update({
      plan,
      stripePriceId: priceId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Create a payment intent for client payment
stripeRoutes.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, therapistId, clientId, appointmentId, description } = req.body;
    
    if (!amount || !currency || !therapistId || !clientId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        therapistId,
        clientId,
        appointmentId: appointmentId || '',
        description: description || ''
      }
    });
    
    // Create payment record in Firestore
    const paymentRef = admin.firestore().collection('payments').doc();
    
    await paymentRef.set({
      id: paymentRef.id,
      therapistId,
      clientId,
      appointmentId: appointmentId || null,
      description: description || '',
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentRef.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook handler for Stripe events
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).send('Missing Stripe signature');
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      functions.config().stripe.webhook_secret
    );
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return res.status(200).send({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Helper functions for webhook handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { therapistId, clientId, appointmentId } = paymentIntent.metadata;
    
    // Find the payment record
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .get();
    
    if (paymentsSnapshot.empty) {
      console.error(`Payment record not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    const paymentDoc = paymentsSnapshot.docs[0];
    
    // Update payment status
    await paymentDoc.ref.update({
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If this payment is for an appointment, update the appointment payment status
    if (appointmentId) {
      await admin.firestore().collection('appointments').doc(appointmentId).update({
        paymentStatus: 'paid',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log(`Payment completed for payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find the payment record
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .get();
    
    if (paymentsSnapshot.empty) {
      console.error(`Payment record not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    const paymentDoc = paymentsSnapshot.docs[0];
    
    // Update payment status
    await paymentDoc.ref.update({
      status: 'failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Payment failed for payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) {
      return;
    }
    
    // Find the subscription record
    const subscriptionsSnapshot = await admin.firestore()
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', subscriptionId)
      .get();
    
    if (subscriptionsSnapshot.empty) {
      console.error(`Subscription record not found for subscription: ${subscriptionId}`);
      return;
    }
    
    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    
    // Update subscription status
    await subscriptionDoc.ref.update({
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Invoice payment succeeded for subscription: ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) {
      return;
    }
    
    // Find the subscription record
    const subscriptionsSnapshot = await admin.firestore()
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', subscriptionId)
      .get();
    
    if (subscriptionsSnapshot.empty) {
      console.error(`Subscription record not found for subscription: ${subscriptionId}`);
      return;
    }
    
    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    
    // Update subscription status
    await subscriptionDoc.ref.update({
      status: 'past_due',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Invoice payment failed for subscription: ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Find the subscription record
    const subscriptionsSnapshot = await admin.firestore()
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', subscription.id)
      .get();
    
    if (subscriptionsSnapshot.empty) {
      console.error(`Subscription record not found for subscription: ${subscription.id}`);
      return;
    }
    
    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    
    // Update subscription status
    await subscriptionDoc.ref.update({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
      currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Find the subscription record
    const subscriptionsSnapshot = await admin.firestore()
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', subscription.id)
      .get();
    
    if (subscriptionsSnapshot.empty) {
      console.error(`Subscription record not found for subscription: ${subscription.id}`);
      return;
    }
    
    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    
    // Update subscription status
    await subscriptionDoc.ref.update({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}
