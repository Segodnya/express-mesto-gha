const mongoose = require('mongoose');
const Card = require('../models/card');
const { DEFAULT_SUCCESS_CODE, SUCCESS_CREATED_CODE } = require('../utils/constants');
const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');
const ForbiddenError = require('../utils/errors/forbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(DEFAULT_SUCCESS_CODE).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(SUCCESS_CREATED_CODE).send(card))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const currentUserId = req.user._id;

  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (!card) {
        return new NotFoundError('Карточка не найдена');
      }
      if (card.owner.toString() !== currentUserId) {
        return new ForbiddenError('Нельзя удалять чужие карточки');
      }
      return card;
    })
    .then((card) => Card.deleteOne(card))
    .then((card) => res.status(DEFAULT_SUCCESS_CODE).send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточка не найдена'));
      }
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Переданы не валидные данные'));
      }
      if (err.status === 403) {
        return next(new ForbiddenError('Вы не автор этой карточки'));
      }
      return next(err);
    });
};

const updateLikes = async (req, res, next, update) => {
  await Card.findByIdAndUpdate(req.params.cardId, update, { new: true })
    .orFail()
    .then((card) => {
      res.status(DEFAULT_SUCCESS_CODE).send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточка не найдена'));
      }
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Переданы не валидные данные'));
      }
      return next(err);
    });
};

module.exports.likeCard = async (req, res) => {
  await updateLikes(req, res, { $addToSet: { likes: req.user._id } });
};

module.exports.dislikeCard = async (req, res) => {
  await updateLikes(req, res, { $pull: { likes: req.user._id } });
};
