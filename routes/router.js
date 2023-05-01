const router = require('express').Router();
const { NOT_FOUND_ERROR_CODE } = require('../utils/constants');

const cardsRouter = require('./cardRoutes');
const usersRouter = require('./userRoutes');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('/*', (req, res) => {
  res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Страница не найдена' });
});

module.exports = router;
