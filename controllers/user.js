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
  } catch (e) {
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
        return res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
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

module.exports.updateUserName = async (req, res) => {
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
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'Не удалось изменить пользователя',
    });
  }
};

module.exports.updateUserAvatar = async (req, res) => {
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
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'Не удалось изменить пользователя',
    });
  }
};
