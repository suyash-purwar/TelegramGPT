import axios from 'axios';

export const sendTextualMessage = async (chatId, response) => {
  const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;
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
  const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;
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
