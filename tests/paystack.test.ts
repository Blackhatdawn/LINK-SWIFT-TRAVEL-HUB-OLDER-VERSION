import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { verifyIvoryPayWebhookSignature } from '../backend/services/ivorypay';

test('verifyIvoryPayWebhookSignature returns true for valid signature', () => {
  process.env.IVORYPAY_SECRET_KEY = 'unit_test_secret';
  const rawBody = Buffer.from(JSON.stringify({ event: 'payment.success', data: { reference: 'LS-RIDE-TEST' } }));
  const signature = crypto.createHmac('sha256', process.env.IVORYPAY_SECRET_KEY!).update(rawBody).digest('hex');

  assert.equal(verifyIvoryPayWebhookSignature(rawBody, signature), true);
});

test('verifyIvoryPayWebhookSignature returns false for invalid signature', () => {
  process.env.IVORYPAY_SECRET_KEY = 'unit_test_secret';
  const rawBody = Buffer.from(JSON.stringify({ event: 'payment.success', data: { reference: 'LS-RIDE-TEST' } }));

  assert.equal(verifyIvoryPayWebhookSignature(rawBody, 'invalid-signature'), false);
});
