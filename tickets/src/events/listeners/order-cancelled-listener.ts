import {Listener, OrderCancelledEvent, Subjects} from '@urtickets/common';
import {Message} from 'node-nats-streaming';
import {queueGroupName} from './queue-group-name';
import {Ticket} from '../../models/ticket';
import { TikcetUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName= queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if(!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as reserved by setting its orderId property
    ticket.set({orderId: undefined});

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