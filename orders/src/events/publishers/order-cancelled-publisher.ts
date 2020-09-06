import {Publisher, OrderCancelledEvent, Subjects} from '@urtickets/common';

export class OrderCancelledPublisher extends Publisher <OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}