const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const { SUCCESS_CREATED_CODE } = require('../utils/constants');
const BadRequestError = require('../utils/errors/badRequestError');
const ConflictError = require('../utils/errors/conflictError');
const UnauthorizedError = require('../utils/errors/unauthorizedError');
const NotFoundError = require('../utils/errors/notFoundError');

module.exports.getUsers = async (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const findUser = (id, res, next) => {
  User.findById(id)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return next(err);
    });
};

module.exports.getUser = (req, res, next) => findUser(req.params.userId, res, next);
module.exports.getMe = (req, res, next) => findUser(req.user._id, res, next);

module.exports.createUser = (req, res, next) => {
  // eslint-disable-next-line object-curly-newline
  const { name, about, avatar, email, password } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    })
      .then((user) => {
        const userNoPassword = user.toObject({ useProjection: true });
        return res.status(SUCCESS_CREATED_CODE).send(userNoPassword);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Переданы не валидные данные'));
        }
        if (err.code === 11000) {
          return next(new ConflictError('Пользователь с данным email уже зарегистрирован'));
        }
        return next(err);
      });
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неверная почта или пароль'));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return next(new UnauthorizedError('Неверная почта или пароль'));
        }
        const token = jwt.sign({ _id: user._id }, 'some-secret-string', { expiresIn: '7d' });
        // res.cookie('jwt', token, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: 'none',
        //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
        // });
        return res.send({ token });
      });
    })
    .catch(next);
};

const updateUser = (id, data, res, next) => {
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Пользователь не найден.'));
      }
      return next(err);
    });
};

module.exports.updateUserName = (req, res, next) => updateUser(req.user._id, req.body, res, next);
module.exports.updateUserAvatar = (req, res, next) => updateUser(req.user._id, req.body, res, next);
