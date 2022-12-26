const express = require('express');
const routes = require('./router/bot.router');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use('/api/v1', routes);

app.listen(PORT, () => {
  console.log(`Bot running on ${PORT}`);
});

module.exports = {
  app,
};
