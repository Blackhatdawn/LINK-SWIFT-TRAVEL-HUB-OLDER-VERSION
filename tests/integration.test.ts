import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';

import User from '../backend/models/User';
import WalletAccount from '../backend/models/WalletAccount';
import RideBooking from '../backend/models/RideBooking';
import PaymentEvent from '../backend/models/PaymentEvent';
import { payForService } from '../backend/controllers/walletController';
import { handleIvoryPayWebhook } from '../backend/controllers/paymentController';

let mongo: MongoMemoryServer;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  process.env.IVORYPAY_SECRET_KEY = 'unit_test_secret';
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

const mockRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: any) => { res.body = payload; return res; };
  return res;
};

test('wallet debit blocks insufficient funds', async () => {
  const user = await User.create({ name: 'Test', email: 'test@x.com', password: 'password123' });
  await WalletAccount.create({ user: user._id, balance: 1000 });

  const req: any = { user: { _id: user._id }, body: { amount: 2000, service: 'express' } };
  const res = mockRes();

  await payForService(req, res as any);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Insufficient funds/i);
});

test('payment webhook confirms ride booking and stores event journal', async () => {
  const user = await User.create({ name: 'Ride User', email: 'ride@x.com', password: 'password123' });
  const ride = await RideBooking.create({
    guest: user._id,
    pickup: { address: 'Victoria Island' },
    dropoff: { address: 'Lekki' },
    date: new Date(Date.now() + 3600000),
    carType: 'Mercedes-Benz S-Class',
    fare: 45000,
    status: 'Payment Required',
    paymentReference: 'LS-RIDE-TESTREF',
  });

  const payload = {
    event: 'payment.success',
    data: { id: '12345', reference: 'LS-RIDE-TESTREF', status: 'success' },
  };
  const rawBody = Buffer.from(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', process.env.IVORYPAY_SECRET_KEY!).update(rawBody).digest('hex');

  const req: any = {
    headers: { 'x-ivorypay-signature': signature },
    body: rawBody,
  };
  const res = mockRes();

  await handleIvoryPayWebhook(req, res as any);

  const refreshedRide = await RideBooking.findById(ride._id);
  const event = await PaymentEvent.findOne({ reference: 'LS-RIDE-TESTREF' });

  assert.equal(res.statusCode, 200);
  assert.equal(refreshedRide?.status, 'Confirmed');
  assert.ok(event);
  assert.equal(event?.processed, true);
});
