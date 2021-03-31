import express from 'express';

var PORT = process.env.PORT || 3000;
var app = express();
app.listen(PORT);

// mqtt connection
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1:1883', {
  username: 'tutorism',
  password: '1234',
});
// var client = mqtt.connect('mqtt://172.16.167.2:1883', {
//   username: 'tutorism',
//   password: '1234',
// });
console.log('connected  ' + client.connected);

client.on('connect', function () {
  console.log('connected  ' + client.connected);
  client.publish('test', 'connected');
});

client.on('error', function (error) {
  console.log("Can't connect" + error);
});

// mongoose connection
const mongoose = require('mongoose');
mongoose.connect(
  // 'mongodb://tutorism:1234@172.16.167.2:27017/temp?authSource=admin',
  'mongodb://tutorism:1234@127.0.0.1:27017/temp?authSource=admin',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// // DB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('DB connected');
});

// // Test schema
// const productSchema = mongoose.Schema({
//   name: String,
//   price: Number,
// });
// const Product = mongoose.model('Product', productSchema);

// const userSchema = mongoose.Schema(
//   {
//     name: String,
//     age: Number,
//   },
//   { collection: 'user' }
// );
// const User = mongoose.model('User', userSchema);

const tempSchema = mongoose.Schema({
  temp: Number,
  timestamp: String,
});
const Temp = mongoose.model('Temp', tempSchema);

app.get('/', (req, res) => {
  return res.status(200).send('hello');
});
// app.get('/open', (req, res) => {
//   client.publish('test', 'open');
//   return res.status(200).send('open');
// });
// app.get('/close', (req, res) => {
//   client.publish('test', 'close');
//   return res.status(200).send('close');
// });
// app.get('/test', (req, res) => {
//   client.publish('test', 'Hello World');
//   return res.status(200).send('success');
// });
app.get('/temp', (req, res) => {
  // Define data
  const { temp } = req.query;
  const timestamp = '' + new Date(Date.now()).toString().split('G')[0];

  // Publish to frontend
  client.publish('temp', '' + temp);
  client.publish('timestamp', timestamp);

  // Write on DB
  const temp = new Temp({
    temp: temp,
    timestamp: timestamp,
  });
  temp
    .save()
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
  return res.status(200).send('success');
});

// app.get('/test', (req, res) => {
//   const product = new Product({
//     name: 'Tutor',
//     price: 1000,
//   });
//   product
//     .save()
//     .then((doc) => console.log(doc))
//     .catch((err) => console.log(err));
//   return res.status(200).send('hello');
// });

// app.get('/insert/user', (req, res) => {
//   const user = new User({
//     name: 'No Collection',
//     age: 20,
//   });

//   user
//     .save()
//     .then((doc) => {
//       console.log(doc);
//       return res.status(200).send('hello');
//     })
//     .catch((err) => {
//       console.log(err);
//       return res.status(400).send('hello');
//     });
// });

// app.get('/find/user', (req, res) => {
//   User.find()
//     .then((doc) => {
//       console.log(doc);
//       return res.status(200).json({ log: doc });
//     })
//     .catch((err) => {
//       console.log(err);
//       return res.status(401).json({ log: 'success' });
//     });
// });
