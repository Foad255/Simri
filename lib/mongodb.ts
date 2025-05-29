import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://f30071779:hPEt4nPLo3A8R38H@cluster0.mxftzon.mongodb.net/Brain-Cancer?retryWrites=true&w=majority&appName=Cluster&tls=true';

const options = {
  tls: true,
  useUnifiedTopology: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
