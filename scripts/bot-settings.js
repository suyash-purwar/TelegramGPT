import axios from 'axios';
import * as dotenv from 'dotenv';
import telegram_command from '../config/commands.js';

dotenv.config({ path: '.env.dev' });

const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

const setWebhook = async (url) => {
  try {
    const res = await axios.post(TELEGRAM_API + '/setWebhook', {
      url: url + '/api/v1/process-msg',
    });
    console.log(res);
  } catch (e) {
    console.log(e.message);
    console.log(e);
  }
};

const setMyCommands = async () => {
  try {
    const res = await axios.post(TELEGRAM_API + '/setMyCommands', telegram_command);
    console.log(res);
  } catch (e) {
    console.log(e.message);
    console.log(e);
  }
};

const getMyCommands = async () => {
  try {
    const res = await axios.get(TELEGRAM_API + '/getMyCommands');
    console.log(res.data.result);
  } catch (e) {
    console.log(e.message);
    console.log(e);
  }
};

// await getMyCommands();
await setWebhook('https://402b-112-196-62-6.in.ngrok.io');
