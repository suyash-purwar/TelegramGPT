const axios = require('axios');
require('dotenv').config();

const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

const sendTextualMessage = async (chatId, response) => {
  try {
    return await axios.post(TELEGRAM_API + '/sendMessage', {
      chat_id: chatId,
      text: response,
    });
  } catch (e) {
    switch (e.message) {
      default:
        console.log(e);
        throw new Error('TELEGRAM_SERVICE_DOWN');
    }
  }
};

const sendImageMessage = async (chatId, response) => {
  try {
    response.forEach(async (url) => {
      await axios.post(TELEGRAM_API + '/sendPhoto', {
        chat_id: chatId,
        photo: url,
      });
    });
  } catch (e) {
    switch (e.message) {
      default:
        console.log(e.message);
        throw new Error('TELEGRAM_SERVICE_DOWN');
    }
  }
};

module.exports = {
  sendTextualMessage,
  sendImageMessage,
};
