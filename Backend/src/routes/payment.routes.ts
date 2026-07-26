import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/payments/create-razorpay-order
router.post('/create-razorpay-order', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      amount: z.number().positive(), // in INR
      currency: z.string().default('INR'),
      orderId: z.string().optional(),
    });

    const { amount, currency, orderId } = schema.parse(req.body);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Seq6pkI96ruWHa';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'RqRI0b2XJbBbxiDR2gQgPGnY';

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // Call Razorpay REST API
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `receipt_${orderId || Date.now()}`,
        notes: {
          userId: req.user!.id,
          app: 'Wellora',
        },
      }),
    });

    const razorpayData = await razorpayResponse.json() as any;

    if (!razorpayResponse.ok) {
      console.error('Razorpay Order Creation Failed:', razorpayData);
      throw new AppError(razorpayData?.error?.description || 'Razorpay order creation failed', 500);
    }

    res.json({
      success: true,
      data: {
        id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        keyId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify-razorpay-payment
router.post('/verify-razorpay-payment', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
      orderId: z.string().optional(),
    });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = schema.parse(req.body);

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'RqRI0b2XJbBbxiDR2gQgPGnY';

    // HMAC SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      throw new AppError('Payment signature verification failed. Invalid payment.', 400);
    }

    // Update order status in DB if orderId provided
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Razorpay payment verified successfully!',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
