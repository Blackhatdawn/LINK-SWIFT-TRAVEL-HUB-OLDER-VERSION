const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const getJwtSecret = () => requiredEnv('JWT_SECRET');

export const getPort = () => {
  const raw = process.env.PORT;
  if (!raw) return 3000;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('PORT must be a positive integer');
  }
  return parsed;
};

export const getAllowedOrigins = () => {
  const raw = process.env.CLIENT_ORIGINS;
  if (!raw) return [] as string[];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const isProduction = process.env.NODE_ENV === 'production';

export const getMongoUri = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) return mongoUri;

  if (isProduction) {
    throw new Error('MONGO_URI must be set in production.');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  console.log('No MONGO_URI provided, starting in-memory MongoDB for local development...');
  const mongoServer = await MongoMemoryServer.create();
  return mongoServer.getUri();
};
