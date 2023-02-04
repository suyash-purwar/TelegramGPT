import axios from 'axios';

export const sendTextualMessage = async (telegramId, message) => {
  const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;
  try {
    return await axios.post(TELEGRAM_API + '/sendMessage', {
      chat_id: telegramId,
      text: message,
    });
  } catch (e) {
    console.log(e.message);
    throw new Error('TELEGRAM_SERVICE_DOWN');
  }
};

export const sendImageMessage = async (telegramId, message) => {
  const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;
  try {
    message.forEach(async (url) => {
      await axios.post(TELEGRAM_API + '/sendPhoto', {
        chat_id: telegramId,
        photo: url,
      });
    });
  } catch (e) {
    console.log(e.message);
    throw new Error('TELEGRAM_SERVICE_DOWN');
  }
};

export const deleteMessage = async (telegramId, messageId) => {
  const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;
  try {
    return await axios.post(TELEGRAM_API + '/deleteMessage', {
      chat_id: telegramId,
      message_id: messageId
    });
  } catch (e) {
    console.log(e);
    throw new Error('TELEGRAM_SERVICE_DOWN');
  }
};