import express, {Request, Response} from 'express';
import {requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError} from '@urtickets/common';
import {body} from 'express-validator';
import {Ticket} from '../models/ticket';
import {TikcetUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,[
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({gt:0}).withMessage('Price must be greater than 0')
] , validateRequest, async (req: Request, res: Response) => {
  
  const ticket = await Ticket.findById(req.params.id);
  
  if(!ticket){
    throw new NotFoundError();
  }

  if(ticket.orderId){
    throw new BadRequestError('Can not edit a reserved ticket');
  }

  if(ticket.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  ticket.set({title:req.body.title, price: req.body.price});
  await ticket.save();
  new TikcetUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    version: ticket.version,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  });
  res.send(ticket);
});

export {router as updateTicketRouter};