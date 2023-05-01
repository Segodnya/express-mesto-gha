// const { MongooseError } = require('mongoose');
const User = require('../models/user');
const {
  SUCCESS_CREATED_CODE,
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
} = require('../utils/constants');

module.exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'Не удалось получить пользователей',
    });
  }
};

module.exports.getUser = async (req, res) => {
  const { userId } = req.params;

  await User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        // if (err instanceof MongooseError.CastError) {
        return res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
        // if (err instanceof MongooseError.DocumentNotFoundError) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Пользователь не найден' });
      }
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: 'Не удалось найти пользователя' });
    });
};

module.exports.createUser = async (req, res) => {
  const { name, about, avatar } = req.body;

  await User.create({
    name,
    about,
    avatar,
  })
    .then((user) => res.status(SUCCESS_CREATED_CODE).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // if (err instanceof MongooseError.ValidationError) {
        res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
      } else {
        res
          .status(DEFAULT_ERROR_CODE)
          .send({ message: 'Не удалось создать пользователя' });
      }
    });
};

async function updateUser(userId, updateData) {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    return updatedUser;
  } catch (err) {
    if (err.name === 'ValidationError') {
      // if (err instanceof MongooseError.ValidationError) {
      throw new Error('Переданы не валидные данные');
    }
    throw new Error('Не удалось изменить пользователя');
  }
}

function updateUserWithName(req, res) {
  const { name, about } = req.body;
  const userId = req.user._id;
  updateUser(userId, { name, about })
    .then((updatedUser) => {
      res.send(updatedUser);
    })
    .catch((err) => {
      res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: err.message,
      });
    });
}

function updateUserWithAvatar(req, res) {
  const { avatar } = req.body;
  const userId = req.user._id;
  updateUser(userId, { avatar })
    .then((updatedUser) => {
      res.send(updatedUser);
    })
    .catch((err) => {
      res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: err.message,
      });
    });
}

module.exports.updateUserName = updateUserWithName;
module.exports.updateUserAvatar = updateUserWithAvatar;
