import { Request, Response } from 'express';
import RideBooking from '../models/RideBooking';
import StayBooking from '../models/StayBooking';
import { verifyPaystackWebhookSignature } from '../services/paystack';
import { createNotification } from './notificationController';

interface PaystackEventData {
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

    if (event.event !== 'charge.success' || event.data?.status !== 'success') {
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const reference = event.data?.reference;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Missing payment reference' });
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

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed', error: error.message });
  }
};
