const { MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;
const { PORT = 3000 } = process.env;
const LIMITER_OPTIONS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

module.exports.MONGO_URL = MONGO_URL;
module.exports.PORT = PORT;
module.exports.LIMITER_OPTIONS = LIMITER_OPTIONS;
