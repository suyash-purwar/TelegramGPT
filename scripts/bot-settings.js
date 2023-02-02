import axios from 'axios';
import * as dotenv from 'dotenv';
import telegram_command from '../config/commands.js';

dotenv.config({ path: '.env.dev' });

const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

const args = process.argv.slice(2);

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
    console.log(res);
  } catch (e) {
    console.log(e.message);
    console.log(e);
  }
};

switch (args[0]) {
  case 'set-webhook':
    setWebhook(args[1]);
    break;
  case 'get-commands':
    getMyCommands();
    break;
  case 'set-commands':
    setMyCommands();
    break;
  default:
    console.log('Invalid operation');
}