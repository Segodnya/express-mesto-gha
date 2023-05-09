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

// module.exports.getUser = async (req, res, next) => {
//   const { userId } = req.params;

//   User.findById(userId)
//     .orFail()
//     .then((user) => {
//       if (!user) {
//         next(new NotFoundError('Пользователь не найден'));
//       }
//       res.send({ data: user });
//     })
//     .catch((err) => {
//       if (err instanceof mongoose.Error.CastError) {
//         next(new BadRequestError('Переданы не валидные данные'));
//       }
//       next(err);
//     });
// };

module.exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
    }
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Переданы не валидные данные'));
    } else {
      next(err);
    }
  }
};

// eslint-disable-next-line consistent-return
// module.exports.getMe = (req, res, next) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       if (!user) {
//         next(new NotFoundError('Пользователь не найден'));
//       }
//       res.status(DEFAULT_SUCCESS_CODE).semd(user);
//     })
//     .catch((err) => {
//       if (err instanceof mongoose.Error.CastError) {
//         next(new BadRequestError('Переданы не валидные данные'));
//       } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
//         next(new NotFoundError('Пользователь не найден'));
//       } else {
//         next(err);
//       }
//     });
// };

module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

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
