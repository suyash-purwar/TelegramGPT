const openai = require('./../apis/openai.api');
const telegram = require('./../apis/telegram.api');

const processMsg = async (chatId, text) => {
  const { type, data } = await routeQueryToProcess(text);

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

const routeQueryToProcess = async (text) => {
  let response;
  if (text.startsWith('/image')) {
    response = await processImageRequest(text);
  } else if (text.startsWith('/about')) {
    response = processAboutRequest();
  } else {
    response = await processTextRequest(text);
  }
  return response;
};

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
  console.log('Textual response');
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

const sendMessage = async (chatId, text) => {
  await telegram.sendTextualMessage(chatId, text);
};

module.exports = {
  processMsg,
  sendMessage,
};
