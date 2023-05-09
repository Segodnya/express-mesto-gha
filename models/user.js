const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const UnauthorizedError = require('../utils/errors/unauthorizedError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      required: [true, 'Поле должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля 2 символа'],
      maxlength: [30, 'Максимальная длина поля 30 символов'],
    },
    about: {
      type: String,
      default: 'Исследователь',
      required: [true, 'Поле должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля 2 символа'],
      maxlength: [30, 'Максимальная длина поля 30 символов'],
    },
    avatar: {
      type: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      required: true,
      validate: {
        validator: (v) => {
          validator.isURL(v, {
            protocols: ['http', 'https'],
            require_protocol: true,
          });
        },
        message: ({ value }) => `${value} - некоректный адрес URL. Ожидается адрес в формате: http(s)://(www).site.com`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: () => 'Введен некорректный email адрес',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.statics.checkUser = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) return Promise.reject(new UnauthorizedError('Неверная почта или пароль'));
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) return Promise.reject(new UnauthorizedError('Неверная почта или пароль'));
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
