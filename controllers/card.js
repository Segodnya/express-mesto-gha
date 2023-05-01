const { MongooseError } = require('mongoose');
const Card = require('../models/card');
const {
  DEFAULT_SUCCESS_CODE,
  SUCCESS_CREATED_CODE,
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
} = require('../utils/constants');

const USER_REF = [{ path: 'likes', model: 'user' }];

module.exports.getCards = async (req, res) => {
  await Card.find({})
    .then((cards) => res.status(DEFAULT_SUCCESS_CODE).send(cards))
    .catch(() => {
      res.status(DEFAULT_ERROR_CODE).send({
        message: 'Не удалось получить карточки',
      });
    });
};

module.exports.createCard = async (req, res) => {
  const { name, link } = req.body;

  await Card.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((card) => res.status(SUCCESS_CREATED_CODE).send(card))
    .catch((err) => {
      // if (err.name === 'ValidationError') {
      if (err instanceof MongooseError.ValidationError) {
        res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
        return;
      }

      res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: 'Не удалось создать карточку' });
    });
};

module.exports.deleteCard = async (req, res) => {
  const { cardId } = req.params;

  await Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Карточка не найдена' });
      }
      return res.status(DEFAULT_SUCCESS_CODE).send(card);
    })
    .catch((err) => {
      // if (err.name === 'CastError') {
      if (err instanceof MongooseError.CastError) {
        res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
      } else {
        res
          .status(DEFAULT_ERROR_CODE)
          .send({ message: 'Не удалось удалить карточку' });
      }
    });
};

const handleCardLike = async (req, res, options) => {
  try {
    const action = options.addLike ? '$addToSet' : '$pull';

    const updatedCard = await Card.findOneAndUpdate(
      req.params.cardId,
      { [action]: { likes: req.user._id } },
      { new: true },
    ).populate(USER_REF);

    if (!updatedCard) {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Карточка не найдена',
      });
    }
    return res.send(updatedCard);
  } catch (err) {
    // if (err.name === 'CastError') {
    if (err instanceof MongooseError.CastError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы не валидные данные',
      });
    }
    return res.status(DEFAULT_ERROR_CODE).send({
      message: 'Не удалось изменить карточку',
    });
  }
};

module.exports.likeCard = (req, res) => {
  handleCardLike(req, res, { addLike: true });
};

module.exports.dislikeCard = (req, res) => {
  handleCardLike(req, res, { addLike: false });
};
