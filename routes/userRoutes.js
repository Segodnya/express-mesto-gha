const userRoutes = require('express').Router();

// eslint-disable-next-line object-curly-newline
const { getUsers, getUser, updateUserName, updateUserAvatar, getMe } = require('../controllers/user');
const { validateUserId, validateUserInfo, validateAvatar } = require('../utils/validators/userValidator');

userRoutes.get('/', getUsers);
userRoutes.get('/me', getMe);
userRoutes.get('/:userId', validateUserId, getUser);
userRoutes.patch('/me', validateUserInfo, updateUserName);
userRoutes.patch('/me/avatar', validateAvatar, updateUserAvatar);

module.exports = userRoutes;
