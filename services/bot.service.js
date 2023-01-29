import * as openai from './../apis/openai.api.js';
import * as telegram from './../apis/telegram.api.js';
import User from './../models/users.js';

export const processMsg = async (chatId, text) => {
  const { type, data } = await routeQueryToProcess(chatId, text);
  switch (type) {
    case 'image':
      await telegram.sendImageMessage(chatId, data);
      break;
    case 'text':
      await telegram.sendTextualMessage(chatId, data);
      break;
    default:
      throw new Error('INTERNAL_SERVER_ERROR');
  }
};

export const sendMessage = async (chatId, text) => {
  await telegram.sendTextualMessage(chatId, text);
};

const routeQueryToProcess = async (chatId, text) => {
  let response;
  if (text.startsWith('/image')) {
    response = await processImageRequest(text);
  } else if (text.startsWith('/about')) {
    response = processAboutRequest();
  } else if (text.startsWith('/start')) {
    response = await processStartRequest(chatId);
  } else if (text.startsWith('/off')) {
    response = await processOffRequest(chatId);
  } else {
    response = await processTextRequest(text);
  }
  return response;
};

const processStartRequest = async (telegram_id) => {
  const user = await User.findOne({ telegram_id }, 'is_active account_type_update_time');
  if (user?.is_active) throw new Error('BOT_ALREADY_STARTED'); 
  if (user && !user?.is_active) {
    console.log(user.account_type_update_time);
    const isItAnotherDay = ((new Date() - new Date(user.account_type_update_time)) / 86400000);
    const updatedData = {
      is_active: true,
    }
    if (isItAnotherDay >= 1.0) {
      console.log(isItAnotherDay)
      updatedData.basic_quota = {
        text: 15,
        image: 5
      }
      updatedData.account_type_update_time = new Date();
    }
    await User.findOneAndUpdate({ telegram_id }, { $set: updatedData });
    return {
      type: 'text',
      data: 'Hephaestus is back to your service! 🔥😄'
    };
  }
  const newUser = new User({
    telegram_id,
    account_type_update_time: new Date()
  });
  await newUser.save();
  const MSG = 'Hephaestus Bot is now at your service. By default, you have a basic account with which you can send 15 text response type and 5 image type requests per day.\n\nYou can be free of this limit by upgrading to premium account and it\'s completely free. Send /upgrade-account command to initiate the process.\n\nSend /help command to get a list of commands.'
  return {
    type: 'text',
    data: MSG
  };
};

const processOffRequest = async (telegram_id) => {
  await User.findOneAndUpdate(
    { telegram_id },
    { 
      $set: {
        is_active: false,
        account_type_update_time: new Date()
      }
    }
  );
  return {
    type: 'text',
    data: 'Sad to see you go! 😢\nI can always be revived by the /start command.',
  };
}

const processImageRequest = async (text) => {
  if (text.length < 10) throw new Error('DESCRIPTION_INSUFFICIENT');
  const query = text.slice(7);
  let imgCount = 1;
  if (!isNaN(parseInt(text[text.length - 1]))) {
    if (!isNaN(parseInt(text[text.length - 2]))) {
      throw new Error('EXCEEDED_IMG_GEN_LIMIT');
    } else {
      imgCount = +text[text.length - 1];
      console.log(imgCount);
    }
  }
  const urls = await openai.generateImageResponse(query, imgCount);
  let response = {
    type: 'image',
    data: urls,
  };
  return response;
};

const processTextRequest = async (text) => {
  if (text[0] === '/') throw new Error('COMMAND_DOES_NOT_EXIST');
  const textualResponse = await openai.generateTextResponse(text);
  let response = {
    data: textualResponse,
    type: 'text',
  };
  return response;
};

const processAboutRequest = () => {
  const about =
    "Hephaestus is a chatbot which internally uses Open AI's most advanced AI - ChatGPT and DALL-E.\nThis bot is an open source project (https://www.github.com/suyash-purwar/hephaestus) and contributions are always welcome. If you liked this bot, do give it a star on github! This project was started by Suyash Purwar (https://www.github.com/suyash-purwar).";
  let response = {
    data: about,
    type: 'text',
  };
  return response;
};
