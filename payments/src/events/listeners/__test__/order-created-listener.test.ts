import {natsWrapper} from '../../../nats-wrapper';
import {OrderCreatedListener} from '../order-created-listener';
import {Message} from 'node-nats-streaming';
import {Order} from '../../../models/order';
import {OrderCreatedEvent, OrderStatus} from '@urtickets/common';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'afghfghafsgh',
    userId: 'jhkjasjk',
    status: OrderStatus.Created,
    ticket: {
      id: 'kjlkjl',
      price: 20
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg}; 
};

it('replicates the order info', async () => {
  const {listener, data, msg} = await setup();
  console.log('Setup called');
  await listener.onMessage(data, msg);
  console.log('listener called');

  const order = await Order.findById(data.id);
  console.log('Order received');
  
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});


