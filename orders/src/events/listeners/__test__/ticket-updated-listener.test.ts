import {TicketUpdatedEvent} from '@urtickets/common';
import {TicketUpdatedListener} from '../ticket-updated-listener';
import {natsWrapper} from '../../../nats-wrapper';
import  mongoose from 'mongoose';
import {Message} from 'node-nats-streaming'; 
import {Ticket} from '../../../models/ticket';

const setup = async () => {

  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  
  // create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 20,
    userId: 'hdjkashdkjsahdkj'
  };


  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, ticket, msg};
};

it('finds, updates and saves a ticket', async () => {

  const {listener, data, ticket, msg} = await setup();

  // call the onMessage function
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  // write assertion to make sure a ticket was created
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);

});

it('acks the message', async () => {

  const {listener, data, msg} = await setup();

  // call the onMessage function
  await listener.onMessage(data, msg);

  // write assertion to make sure a ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has skipped a version', async () => {

  const {listener, data, ticket, msg} = await setup();
  data.version = 10;

  // call the onMessage function
  try {
   await listener.onMessage(data, msg);
  } catch (err) {

  } 

  // write assertion to make sure a ack function is called
  expect(msg.ack).not. toHaveBeenCalled();
  
});