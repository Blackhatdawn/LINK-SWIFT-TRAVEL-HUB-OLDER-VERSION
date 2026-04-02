import crypto from 'crypto';

const IVORYPAY_BASE_URL = 'https://api.ivorypay.io';

const getIvoryPaySecretKey = () => {
  const key = process.env.IVORYPAY_SECRET_KEY;
  if (!key) {
    throw new Error('IVORYPAY_SECRET_KEY is required');
  }
  return key;
};

const getIvoryPayPublicKey = () => {
  const key = process.env.IVORYPAY_PUBLIC_KEY;
  if (!key) {
    throw new Error('IVORYPAY_PUBLIC_KEY is required');
  }
  return key;
};

export const initializeIvoryPayTransaction = async (params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}) => {
  const publicKey = getIvoryPayPublicKey();

  const response = await fetch(`${IVORYPAY_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'x-api-key': publicKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata || {},
      callback_url: params.callback_url,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Failed to initialize Ivory Pay transaction');
  }

  return payload.data;
};

export const verifyIvoryPayWebhookSignature = (rawBody: Buffer, signatureHeader?: string) => {
  const key = getIvoryPaySecretKey();
  if (!signatureHeader) return false;

  const hash = crypto
    .createHmac('sha256', key)
    .update(rawBody)
    .digest('hex');

  const signature = Buffer.from(signatureHeader, 'utf8');
  const computed = Buffer.from(hash, 'utf8');

  if (signature.length !== computed.length) return false;
  return crypto.timingSafeEqual(signature, computed);
};
