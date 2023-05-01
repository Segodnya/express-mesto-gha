const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const { PORT = 3000 } = process.env;

const app = express();
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '644e29ad9efb440d56613c95',
  };

  next();
});

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
