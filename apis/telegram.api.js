import axios from 'axios';
import telegram_command from './../config/commands.js';

const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

export const sendTextualMessage = async (chatId, response) => {
  try {
    return await axios.post(TELEGRAM_API + '/sendMessage', {
      chat_id: chatId,
      text: response,
    });
  } catch (e) {
    console.log(e.message);
    throw new Error('TELEGRAM_SERVICE_DOWN');
  }
};

export const sendImageMessage = async (chatId, response) => {
  try {
    response.forEach(async (url) => {
      await axios.post(TELEGRAM_API + '/sendPhoto', {
        chat_id: chatId,
        photo: url,
      });
    });
  } catch (e) {
    console.log(e.message);
    throw new Error('TELEGRAM_SERVICE_DOWN');
  }
};

export const setWebhook = async (url) => {
  try {
    await axios.post(TELEGRAM_API + '/setWebhook', {
      url: url + '/api/v1/process-msg',
    });
  } catch (e) {
    console.log(e.message);
    throw new Error('WEBHOOK_URL_NOT_SET');
  }
};

export const setMyCommands = async (commands) => {
  try {
    console.log(commands);
    await axios.post(TELEGRAM_API + '/setMyCommands', commands);
  } catch (e) {
    console.log(e.message);
    throw new Error('BOT_COMMANDS_NOT_SET');
  }
};

export const getMyCommands = async () => {
  try {
    const response = await axios.get(TELEGRAM_API + '/getMyCommands');
    return response.data.result;
  } catch (e) {
    console.log(e.message);
    throw new Error('BOT_COMMANDS_NOT_FETCHED');
  }
};
