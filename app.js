const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { MONGO_URL, PORT, LIMITER_OPTIONS } = require('./config');

const limiter = rateLimit(LIMITER_OPTIONS);

const app = express();

const errorsHandler = require('./middlewares/errorHandler');

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(helmet());
app.use(express.json());

mongoose.connect(MONGO_URL, {});
app.use('/', require('./routes/router'));

app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});
