import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {

  console.log('BEFORE ALL')
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  console.log('BEFORE ALL 1')

  const mongoUri = await mongo.getUri();
  console.log('BEFORE ALL 2 ', mongoUri)

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to mongo DB');

});

beforeEach(async () => {
  console.log('BEFORE EACH')
  
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for(let collection of collections){
    await collection.deleteMany({});
  }
console.log('Before Each 2')

});

// afterEach(() => { 
//   jest.clearAllMocks(); 
//   jest.resetAllMocks();
// });

afterAll(async () => {
  console.log('AFTER ALL')

  await mongo.stop();
  console.log('AFTER ALL 2')

  await mongoose.connection.close();

  console.log('AFTER ALL 3')

});

global.signin = (id?: string) => {
  
  // Build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object. {jwt: MY_JWT}
  const session = {jwt: token};

  //Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
};