import * as botService from './../services/bot.service.js';
import httpStatus from 'http-status';

export const processMsg = async (req, res) => {
  console.log(req.body);
  const chatId = req.body.message?.chat.id;
  const text = req.body.message?.text;
  try {
    if (!chatId || !text) throw new Error('ATTEMPT_TO_EDIT_MSG');
    await botService.processMsg(chatId, text);
    res.sendStatus(httpStatus.OK);
  } catch (e) {
    switch (e.message) {
      case 'COMMAND_DOES_NOT_EXIST':
        await botService.sendMessage(
          chatId,
          `The ${text} command does not exist.`
        );
        break;
      case 'ATTEMPT_TO_EDIT_MSG':
        await botService.sendMessage(
          req.body.edited_message.chat.id,
          'Responses are not provided on edited messages.'
        );
        break;
      case 'OPENAI_SERVICE_DOWN':
        await botService.sendMessage(
          chatId,
          'OpenAI API services temporarily down.'
        );
        break;
      case 'TELEGRAM_SERVICE_DOWN':
        await botService.sendMessage(
          chatId,
          'Telegram Bot API services temporarily down.'
        );
        break;
      case 'DESCRIPTION_INSUFFICIENT':
        await botService.sendMessage(
          chatId,
          'Please elaborate the image you want to generate.'
        );
        break;
      case 'EXCEEDED_IMG_GEN_LIMIT':
        await botService.sendMessage(
          chatId,
          'At max ten images can be generated per query.'
        );
        break;
      case 'INTERNAL_SERVER_ERROR':
      default:
        console.log(e);
        console.log(e.message);
        await botService.sendMessage(
          chatId,
          'We have experienced unknown internal error. Hephaestus will shortly be back in service.'
        );
        break;
    }
    res.send(e.message);
  }
};
