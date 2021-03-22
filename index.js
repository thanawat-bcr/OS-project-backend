import express from 'express';

const mongoose = require('mongoose');
mongoose.connect(
  //   'mongodb://172.16.167.2:27017/test',
  'mongodb://tutorism:1234@172.16.167.2:27017/test?authSource=admin',
  //   'mongodb://127.0.0.1:27017/myDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var PORT = process.env.PORT || 80;
var app = express();
app.listen(PORT);

// DB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('DB connected');
});

// Test schema
const productSchema = mongoose.Schema({
  name: String,
  price: Number,
});
const Product = mongoose.model('Product', productSchema);

const userSchema = mongoose.Schema(
  {
    name: String,
    age: Number,
  },
  { collection: 'user' }
);
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  return res.status(200).send('hello');
});

app.get('/test', (req, res) => {
  const product = new Product({
    name: 'Tutor',
    price: 1000,
  });
  product
    .save()
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
  return res.status(200).send('hello');
});

app.get('/insert/user', (req, res) => {
  const user = new User({
    name: 'No Collection',
    age: 20,
  });

  user
    .save()
    .then((doc) => {
      console.log(doc);
      return res.status(200).send('hello');
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('hello');
    });
});

app.get('/find/user', (req, res) => {
  User.find()
    .then((doc) => {
      console.log(doc);
      return res.status(200).json({ log: doc });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ log: 'success' });
    });
});
