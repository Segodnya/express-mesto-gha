const mongoose = require('mongoose');
const Card = require('../models/card');
const {
  DEFAULT_SUCCESS_CODE,
  SUCCESS_CREATED_CODE,
} = require('../utils/constants');
const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');
const ForbiddenError = require('../utils/errors/forbiddenError');

module.exports.getCards = async (req, res, next) => {
  await Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(DEFAULT_SUCCESS_CODE).send(cards))
    .catch((err) => {
      next(err);
    });
};

module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;

  await Card.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((card) => res.status(SUCCESS_CREATED_CODE).send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      }

      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return new NotFoundError('Карточка не найдена');
      }
      if (card.owner.toString() !== cardId) {
        return new ForbiddenError('Нельзя удалять чужие карточки');
      }
      return Card.findByIdAndRemove(cardId).then(() => {
        res.send({ message: 'Карточка удалена' });
      });
    })
    .catch(next);
};

const updateLikes = async (req, res, next, update) => {
  await Card.findByIdAndUpdate(req.params.cardId, update, { new: true })
    .then((card) => {
      if (!card) {
        return new NotFoundError('Карточка не найдена');
      }
      return res.status(DEFAULT_SUCCESS_CODE).send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы не валидные данные'));
      }
      next(err);
    });
};

module.exports.likeCard = async (req, res) => {
  await updateLikes(req, res, { $addToSet: { likes: req.user._id } });
};

module.exports.dislikeCard = async (req, res) => {
  await updateLikes(req, res, { $pull: { likes: req.user._id } });
};
