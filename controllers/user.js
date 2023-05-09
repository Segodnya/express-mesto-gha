const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const {
  SUCCESS_CREATED_CODE,
  NOT_FOUND_ERROR_CODE,
  JWT_SECRET,
} = require('../utils/constants');
const BadRequestError = require('../utils/errors/badRequestError');
const ConflictError = require('../utils/errors/conflictError');

module.exports.getUsers = async (req, res, next) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  await User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы не валидные данные'));
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь не найден' });
      }
      next(err);
    });
};

module.exports.createUser = async (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  await User.create({
    name,
    about,
    avatar,
    email,
    password: bcrypt.hash(password, 10),
  })
    .then((user) => res.status(SUCCESS_CREATED_CODE).send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(
          new ConflictError('Пользователь с данным email уже зарегистрирован'),
        );
      } else if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы не валидные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.checkUser(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.send(token);
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserName = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(updatedUser);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.updateUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(updatedUser);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.send(user);
  } catch (err) {
    return next(err);
  }
};
