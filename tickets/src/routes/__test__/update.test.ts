import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

const createTicket = () => {

  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    });
};

it('returns a 404 if the provided id does not exist', async () => {

  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(404);

});

it('returns a 401 if the user is not authenticated', async () => {

  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 10
    })
    .expect(401);

});

it('returns a 401 if the user does not own a ticket', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'newTicket',
      price: 20
    })
    .expect(401);

});

it('returns a 400 if the user  provides an invalid title or price', async () => {
  
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newTitle',
      price: -10
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400);

});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newTitle',
      price: 20
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

    expect(ticketResponse.body.title).toEqual('newTitle');
    expect(ticketResponse.body.price).toEqual(20);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    });
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newTitle',
      price: 20
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved' , async () => {

  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    });
  
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newTitle',
      price: 20
    })
    .expect(400);

    expect(natsWrapper.client.publish).toHaveBeenCalled();  
});
