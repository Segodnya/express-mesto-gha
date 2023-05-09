const express = require('express');
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const router = require('./routes/router');
const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/errorHandler');
const {
  validateLogin,
  validateRegister,
} = require('./utils/validators/userValidator');
const { login, createUser } = require('./controllers/user');

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
mongoose.connect(MONGO_URL);
app.post('/signin', validateLogin, login);
app.post('/signup', validateRegister, createUser);
app.use(auth);
app.use(router);
app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});
