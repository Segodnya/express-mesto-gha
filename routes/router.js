const router = require('express').Router();
const NotFoundError = require('../utils/errors/notFoundError');

const cardsRouter = require('./cardRoutes');
const usersRouter = require('./userRoutes');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('/*', () => {
  throw new NotFoundError(
    'Запрашиваемый адрес не найден. Проверьте URL и метод запроса',
  );
});

module.exports = router;
