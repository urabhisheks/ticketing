import {Publisher, Subjects, TicketUpdatedEvent} from '@urtickets/common';

export class TikcetUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}