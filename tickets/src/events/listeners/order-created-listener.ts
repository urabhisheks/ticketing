import {Listener, OrderCreatedEvent, Subjects} from '@urtickets/common';
import {Message} from 'node-nats-streaming';
import {queueGroupName} from './queue-group-name';
import {Ticket} from '../../models/ticket';
import { TikcetUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName= queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if(!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as reserved by setting its orderId property
    ticket.set({orderId: data.id});

    // save the ticket
    await ticket.save();
    
    await new TikcetUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,

    });

    // ack the message
    msg.ack();
  }

}