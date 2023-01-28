import httpStatus from 'http-status';
import * as telegram from './../apis/telegram.api.js';

export const setWebhook = async (req, res) => {
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

export const setMyCommands = async (req, res) => {
  try {
    const commands = req.body;
    await telegram.setMyCommands(commands);
    res.sendStatus(httpStatus.OK);
  } catch (e) {
    res.status(httpStatus.FAILED_DEPENDENCY).send({
      error: e.message,
    });
  }
};

export const getMyCommands = async (req, res) => {
  try {
    const response = await telegram.getMyCommands();
    res.send(response);
  } catch (e) {
    res.status(httpStatus.FAILED_DEPENDENCY).send({
      error: e.message,
    });
  }
};

// module.exports = {
//   setWebhook,
//   setMyCommands,
//   getMyCommands,
// };
