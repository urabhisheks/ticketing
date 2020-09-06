import {ExpirationCompleteEvent, OrderStatus} from '@urtickets/common';
import {ExpirationCompleteListener} from '../expiration-complete-listener';
import {natsWrapper} from '../../../nats-wrapper';
import  mongoose from 'mongoose';
import {Message} from 'node-nats-streaming'; 
import {Ticket} from '../../../models/ticket';
import {Order} from '../../../models/order';

const setup = async () => {

  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),  
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'asdfghj',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg, ticket, order};
};

it('updates the order status to cancelled', async () => {

  const {listener, data, msg, order} = await setup();

  // call the onMessage function
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emit an OrderCancelled event', async () => {

  const {listener, data, msg, order} = await setup();

  // call the onMessage function
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);

});

it('ack the message', async () => {

  const {listener, data, msg} = await setup();

  // call the onMessage function
  await listener.onMessage(data, msg);

  // write assertion to make sure a ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
