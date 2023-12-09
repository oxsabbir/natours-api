// 4 START SERVER
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// configuring the environment variable

dotenv.config({ path: './config.env' });

const app = require('./app');

// connecting to the real database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log('database established'))
  .catch((err) => console.log(err));

const port = process.env.PORT;

app.listen(port, '127.0.0.1', () => {
  console.log(`listening to ${port} port...`);
});
