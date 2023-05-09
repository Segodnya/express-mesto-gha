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
module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return new NotFoundError('Карточка не найдена');
    }
    if (card.owner.toString() !== req.params.cardId) {
      return new ForbiddenError('Нельзя удалять чужие карточки');
    }
    await Card.findByIdAndRemove(req.params.cardId);
    res.send({
      message: 'Карточка удалена',
    });
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Переданы не валидные данные'));
    } else {
      next(err);
    }
  }
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
module.exports.likeCard = async (req, res, next) => {
  try {
    await updateLikes(req, res, next, { $addToSet: { likes: req.user._id } });
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
module.exports.dislikeCard = async (req, res, next) => {
  try {
    await updateLikes(req, res, next, { $pull: { likes: req.user._id } });
  } catch (err) {
    return next(err);
  }
};
