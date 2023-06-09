[![Tests](../../actions/workflows/tests-13-sprint.yml/badge.svg)](../../actions/workflows/tests-13-sprint.yml) [![Tests](../../actions/workflows/tests-14-sprint.yml/badge.svg)](../../actions/workflows/tests-14-sprint.yml)

# Проект Mesto фронтенд + бэкенд

Бэкенд сервиса Mesto. Сервер - Express, БД - MongoDB с двумя схемами (пользователи, карточки). Реализована авторизация и регистрация пользователей, хранение и обработка JWT в заголовках запросов, защита API авторизацией. Централизованная обработка ошибок запросов, валидация приходящих данных (Joi). Настроены конфигурации для ESLint, Prettier.

## Репозиторий

https://github.com/Segodnya/express-mesto-gha

## Директории

`/routes` — папка с файлами роутера  
`/controllers` — папка с файлами контроллеров пользователя и карточки  
`/models` — папка с файлами описания схем пользователя и карточки
`/middlewares` — папка с миддлвэрами для авторизации пользователя и обработки ошибок
`/utils` — папка с файлами кастомных классов ошибок, Joi-валидаторами и констант для кодов ошибок

## Запуск проекта

`npm run start` — запускает сервер  
`npm run dev` — запускает сервер с hot-reload
`npm run lint` - запускает проверку ESLint

## Библиотеки

- Rate Limit: https://www.npmjs.com/package/express-rate-limit
- Helmet: https://expressjs.com/en/advanced/best-practice-security.html
