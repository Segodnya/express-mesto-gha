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

// eslint-disable-next-line consistent-return
module.exports.deleteCard = (req, res, next) => {
  const currentUserId = req.user._id;

  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (card.owner.toString() !== currentUserId) {
        throw new ForbiddenError('Нельзя удалить чужую карточку');
      }
      return Card.findByIdAndDelete(card._id);
    })
    .then((deletedCard) => res.status(DEFAULT_SUCCESS_CODE).send(deletedCard))
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

// eslint-disable-next-line consistent-return
const updateLikes = async (req, res, next, update) => {
  try {
    // eslint-disable-next-line max-len
    const updatedCard = await Card.findByIdAndUpdate(req.params.cardId, update, { new: true }).orFail();
    res.status(DEFAULT_SUCCESS_CODE).send(updatedCard);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return next(new NotFoundError('Карточка не найдена'));
    }
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError('Переданы не валидные данные'));
    }
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
module.exports.likeCard = (req, res, next) => {
  updateLikes(req, res, next, { $addToSet: { likes: req.user._id } })
    .then(() => {
      res.status(DEFAULT_SUCCESS_CODE).send({ message: 'Карточка лайкнута' });
    })
    .catch((err) => {
      next(err);
    });
};

// eslint-disable-next-line consistent-return
module.exports.dislikeCard = (req, res, next) => {
  updateLikes(req, res, next, { $pull: { likes: req.user._id } })
    .then(() => {
      res.status(DEFAULT_SUCCESS_CODE).send({ message: 'Вы убрали лайк с карточки' });
    })
    .catch((err) => {
      next(err);
    });
};
