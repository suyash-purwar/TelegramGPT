const httpStatus = require('http-status');
const telegram = require('./../apis/telegram.api');

const setWebhook = async (req, res) => {
  try {
    const { url } = req.body;
    await telegram.setWebhook(url);
    res.sendStatus(httpStatus.OK);
  } catch (e) {
    res.status(httpStatus.FAILED_DEPENDENCY).send({
      error: e.message,
    });
  }
};

const setMyCommands = async (req, res) => {
  try {
    await telegram.setMyCommands();
    res.sendStatus(httpStatus.OK);
  } catch (e) {
    res.status(httpStatus.FAILED_DEPENDENCY).send({
      error: e.message,
    });
  }
};

const getMyCommands = async (req, res) => {
  try {
    const response = await telegram.getMyCommands();
    res.send(response);
  } catch (e) {
    res.status(httpStatus.FAILED_DEPENDENCY).send({
      error: e.message,
    });
  }
};

module.exports = {
  setWebhook,
  setMyCommands,
  getMyCommands,
};
