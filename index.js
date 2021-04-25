import express from 'express';
import cors from 'cors';

var PORT = process.env.PORT || 3000;
var app = express();
app.use(cors());
app.listen(PORT);

// mqtt connection
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1:1883', {
  username: 'tutorism',
  password: '1234',
});
// var client = mqtt.connect('mqtt://192.168.1.37:1883', {
//   uyarnsername: 'tutorism',
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
  // 'mongodb://tutorism:1234@192.168.1.37:27017/data?authSource=admin',
  'mongodb://tutorism:1234@127.0.0.1:27017/data?authSource=admin',
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

const tempSchema = mongoose.Schema(
  {
    temp: Number,
    day: String,
    date: String,
    month: String,
    year: String,
    hour: String,
    minute: String,
    second: String,
  },
  { collection: 'temp' }
);
const Temp = mongoose.model('Temp', tempSchema);

app.get('/', (req, res) => {
  return res.status(200).send('hello');
});

app.get('/test', (req, res) => {
  return res.status(200).json({ log: 'success' });
});

app.get('/temp', (req, res) => {
  // Define data
  const { temp } = req.query;
  const timestamp = '' + new Date(Date.now()).toString().split('G')[0];
  const tmp = timestamp.split(' ');
  const day = tmp[0];
  const times = tmp[4].split(':');
  const hour = times[0];
  const minute = times[1];
  const second = times[2];

  const now = new Date();
  const year = now.getFullYear();
  const month =
    now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
  const date = now.getDate();

  // Publish to frontend
  client.publish('temp', '' + temp);
  client.publish('timestamp', timestamp);

  // Write on DB
  const tempItem = new Temp({
    temp,
    day,
    date,
    month,
    year,
    hour,
    minute,
    second,
  });

  tempItem
    .save()
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
  return res.status(200).send('success');
});

app.get('/temp/date', (req, res) => {
  const { date, month, year } = req.query;
  Temp.find({ date: date, month: month, year: year })
    .then((doc) => {
      console.log(doc);
      return res.status(200).json({ log: doc });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ log: 'success' });
    });
});

app.get('/temp/temp', (req, res) => {
  const { temp } = req.query;
  Temp.find({ temp: temp })
    .then((doc) => {
      console.log(doc);
      return res.status(200).json({ log: doc });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ log: 'success' });
    });
});

app.get('/temp/remove', (req, res) => {
  const { id } = req.query;
  console.log(id);

  Temp.remove({ _id: id })
    .then((doc) => {
      console.log(doc);
      return res.status(200).json({ log: doc });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ log: 'success' });
    });
});
app.get('/temp/update', (req, res) => {
  const { id, temp, date, month, year, hour, minute, second } = req.query;
  Temp.findOneAndUpdate(
    { _id: id },
    { temp, date, month, year, hour, minute, second }
  )
    .then((doc) => {
      console.log(doc);
      return res.status(200).json({ log: doc });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ log: 'success' });
    });
});
