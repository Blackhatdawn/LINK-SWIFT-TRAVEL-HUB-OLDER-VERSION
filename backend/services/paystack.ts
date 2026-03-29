import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getPaystackSecretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is required');
  }
  return key;
};

export const initializePaystackTransaction = async (params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) => {
  const key = getPaystackSecretKey();

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata || {},
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || 'Failed to initialize Paystack transaction');
  }

  return payload.data;
};

export const verifyPaystackWebhookSignature = (rawBody: Buffer, signatureHeader?: string) => {
  const key = getPaystackSecretKey();
  if (!signatureHeader) return false;

  const hash = crypto
    .createHmac('sha512', key)
    .update(rawBody)
    .digest('hex');

  const signature = Buffer.from(signatureHeader, 'utf8');
  const computed = Buffer.from(hash, 'utf8');

  if (signature.length !== computed.length) return false;
  return crypto.timingSafeEqual(signature, computed);
};
