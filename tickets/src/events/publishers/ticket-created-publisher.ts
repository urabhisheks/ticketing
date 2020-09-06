import {Publisher, Subjects, TicketCreatedEvent} from '@urtickets/common';

export class TikcetCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}