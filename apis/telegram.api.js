import axios from 'axios';

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
