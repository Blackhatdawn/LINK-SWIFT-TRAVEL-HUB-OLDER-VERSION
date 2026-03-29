import { Request, Response } from 'express';
import crypto from 'crypto';
import RideBooking from '../models/RideBooking';
import StayBooking from '../models/StayBooking';
import PaymentEvent from '../models/PaymentEvent';
import { verifyPaystackWebhookSignature } from '../services/paystack';
import { createNotification } from './notificationController';

interface PaystackEventData {
  id?: number;
  reference?: string;
  status?: string;
  metadata?: { bookingType?: 'ride' | 'stay' };
}

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature']?.toString();
    const rawBody = req.body as Buffer;

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ success: false, message: 'Invalid Paystack signature' });
    }

    const event = JSON.parse(rawBody.toString('utf-8')) as {
      event?: string;
      data?: PaystackEventData;
    };

    const reference = event.data?.reference;
    const eventKey = event.data?.id
      ? `paystack:${event.data.id}`
      : `paystack:${crypto.createHash('sha256').update(rawBody).digest('hex')}`;

    const existing = await PaymentEvent.findOne({ eventKey });
    if (existing?.processed) {
      return res.status(200).json({ success: true, message: 'Duplicate event ignored' });
    }

    await PaymentEvent.updateOne(
      { eventKey },
      {
        $setOnInsert: {
          provider: 'paystack',
          eventKey,
          reference,
          eventType: event.event || 'unknown',
          payload: event,
        },
      },
      { upsert: true }
    );

    if (event.event !== 'charge.success' || event.data?.status !== 'success' || !reference) {
      await PaymentEvent.updateOne({ eventKey }, { $set: { processed: true } });
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    if (reference.startsWith('LS-RIDE-')) {
      const ride = await RideBooking.findOne({ paymentReference: reference });
      if (ride && ride.status !== 'Confirmed') {
        ride.status = 'Confirmed';
        await ride.save();

        await createNotification(
          ride.guest.toString(),
          'Ride Payment Confirmed',
          `Payment confirmed for your ${ride.carType} ride.`,
          'ride',
          ride._id.toString()
        );
      }
    }

    if (reference.startsWith('LS-STAY-')) {
      const stay = await StayBooking.findOne({ paymentReference: reference });
      if (stay && stay.status !== 'Confirmed') {
        stay.status = 'Confirmed';
        await stay.save();

        await createNotification(
          stay.guest.toString(),
          'Stay Payment Confirmed',
          'Your stay booking payment has been confirmed.',
          'stay',
          stay._id.toString()
        );
      }
    }

    await PaymentEvent.updateOne({ eventKey }, { $set: { processed: true } });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed', error: error.message });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  const { reference } = req.params;
  const ride = await RideBooking.findOne({ paymentReference: reference });
  if (ride) {
    return res.status(200).json({ success: true, data: { type: 'ride', status: ride.status, reference } });
  }

  const stay = await StayBooking.findOne({ paymentReference: reference });
  if (stay) {
    return res.status(200).json({ success: true, data: { type: 'stay', status: stay.status, reference } });
  }

  return res.status(404).json({ success: false, message: 'Payment reference not found' });
};
