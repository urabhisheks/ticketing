import {Listener, Subjects, OrderCreatedEvent} from '@urtickets/common';
import {queueGroupName} from './queue-group-name';
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage (data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    });
    console.log('Order ', order);
    await order.save();
    console.log('Order saved ');

    msg.ack();
  }
}