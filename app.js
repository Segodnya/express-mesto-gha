const express = require('express');
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
const mongoose = require('mongoose');
const router = require('./routes/router');

const { MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;
const { PORT = 3000 } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '644e29ad9efb440d56613c95',
  };
  next();
});

app.use(router);

mongoose.connect(MONGO_URL);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
