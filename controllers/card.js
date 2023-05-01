// const { MongooseError } = require('mongoose');
const Card = require('../models/card');
const {
  DEFAULT_SUCCESS_CODE,
  SUCCESS_CREATED_CODE,
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
} = require('../utils/constants');

module.exports.getCards = async (req, res) => {
  await Card.find({})
    .populate(['owner', 'likes'])
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
      if (err.name === 'ValidationError') {
        // if (err instanceof MongooseError.ValidationError) {
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
      if (err.name === 'CastError') {
        // if (err instanceof MongooseError.CastError) {
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

// module.exports.likeCard = async (req, res) => {
//   await Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } },
//     { new: true },
//   )
//     .then((card) => {
//       if (!card) {
//         return res
//           .status(NOT_FOUND_ERROR_CODE)
//           .send({ message: 'Карточка не найдена' });
//       }
//       return res.status(DEFAULT_SUCCESS_CODE).send(card);
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res
//           .status(INCORRECT_DATA_ERROR_CODE)
//           .send({ message: 'Переданы не валидные данные' });
//       }
//       return res
//         .status(DEFAULT_ERROR_CODE)
//         .send({ message: 'Не удалось изменить карточку' });
//     });
// };

// module.exports.dislikeCard = async (req, res) => {
//   await Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } },
//     { new: true },
//   )
//     .then((card) => {
//       if (!card) {
//         return res
//           .status(NOT_FOUND_ERROR_CODE)
//           .send({ message: 'Карточка не найдена' });
//       }
//       return res.status(DEFAULT_SUCCESS_CODE).send(card);
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res
//           .status(INCORRECT_DATA_ERROR_CODE)
//           .send({ message: 'Переданы не валидные данные' });
//       }
//       return res
//         .status(DEFAULT_ERROR_CODE)
//         .send({ message: 'Не удалось изменить карточку' });
//     });
// };

const updateLikes = async (req, res, update) => {
  await Card.findByIdAndUpdate(req.params.cardId, update, { new: true })
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: 'Карточка не найдена' });
      }
      return res.status(DEFAULT_SUCCESS_CODE).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(INCORRECT_DATA_ERROR_CODE)
          .send({ message: 'Переданы не валидные данные' });
      }
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: 'Не удалось изменить карточку' });
    });
};

module.exports.likeCard = async (req, res) => {
  await updateLikes(req, res, { $addToSet: { likes: req.user._id } });
};

module.exports.dislikeCard = async (req, res) => {
  await updateLikes(req, res, { $pull: { likes: req.user._id } });
};
