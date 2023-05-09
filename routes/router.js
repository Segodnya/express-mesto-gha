const router = require('express').Router();
const { errors } = require('celebrate');
const NotFoundError = require('../utils/errors/notFoundError');

const cardsRouter = require('./cardRoutes');
const usersRouter = require('./userRoutes');

const { login, createUser } = require('../controllers/user');
const { validateLogin, validateRegister } = require('../utils/validators/userValidator');
const auth = require('../middlewares/auth');

router.post('/signin', validateLogin, login);
router.post('/signup', validateRegister, createUser);

router.use(auth);

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('/*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый адрес не найден. Проверьте URL и метод запроса'));
});
router.use(errors({ message: 'Ошибка валидации данных!' }));

module.exports = router;
