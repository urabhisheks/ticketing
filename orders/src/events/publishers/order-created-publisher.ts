import {Publisher, OrderCreatedEvent, Subjects} from '@urtickets/common';

export class OrderCreatedPublisher extends Publisher <OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}