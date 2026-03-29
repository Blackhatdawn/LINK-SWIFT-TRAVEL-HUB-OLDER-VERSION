import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { verifyPaystackWebhookSignature } from '../backend/services/paystack';

test('verifyPaystackWebhookSignature returns true for valid signature', () => {
  process.env.PAYSTACK_SECRET_KEY = 'unit_test_secret';
  const rawBody = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'LS-RIDE-TEST' } }));
  const signature = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(rawBody).digest('hex');

  assert.equal(verifyPaystackWebhookSignature(rawBody, signature), true);
});

test('verifyPaystackWebhookSignature returns false for invalid signature', () => {
  process.env.PAYSTACK_SECRET_KEY = 'unit_test_secret';
  const rawBody = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'LS-RIDE-TEST' } }));

  assert.equal(verifyPaystackWebhookSignature(rawBody, 'invalid-signature'), false);
});
