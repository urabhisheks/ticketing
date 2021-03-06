import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {Payment} from '../../models/payment';
import { OrderStatus } from '@urtickets/common';
import {stripe} from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'lsdjflk',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);

});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'lsdjflk',
      orderId: order.id
    })
    .expect(401);

});

it('returns a 400 when purchasing a cancelled order', async () => {

  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled
  });

  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'lsdjflk',
      orderId: order.id
    })
    .expect(400);

});

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

    const chargedOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargedOptions.source).toEqual('tok_visa');
    expect(chargedOptions.amount).toEqual(10 * 100);
    expect(chargedOptions.currency).toEqual('usd');

    // const payment = Payment.findOne({
    //   orderId: order.id,
    //   stripeId: stripeCharge.id
    // });

    // expect(Payment).not.toBeNull();
});