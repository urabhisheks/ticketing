import {Message} from 'node-nats-streaming';
import {OrderCreatedListener} from '../order-created-listener';
import {OrderCreatedEvent, OrderStatus} from '@urtickets/common';
import {natsWrapper} from '../../../nats-wrapper';
import {Ticket} from '../../../models/ticket';
import mongoose from 'mongoose';


const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: 'hgghgjhgjhgjh'
  });
  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'gjhgjhgjhh',
    expiresAt: 'hkjhhhkj',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, ticket, data, msg};
};

it('sets the userId of the ticket', async () => {
  const {listener, data, ticket, msg} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const {listener, data, ticket, msg} = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
  
});

it('publishes a ticket updated event', async () => {
  const {listener, data, ticket, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);

});