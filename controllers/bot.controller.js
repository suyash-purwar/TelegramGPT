import * as botService from './../services/bot.service.js';
import httpStatus from 'http-status';

export const processMsg = async (req, res) => {
  const telegramId = req.body.message?.chat.id;
  const msg = req.body.message?.text;
  try {
    // If telegramId or text does not exist, it implies that
    // user has made the request to edit an old message
    if (!telegramId || !msg) throw new Error('ATTEMPT_TO_EDIT_MSG');
    await botService.processMsg(telegramId, msg);
    res.sendStatus(httpStatus.OK);
  } catch (e) {
    switch (e.message) {
      case 'COMMAND_DOES_NOT_EXIST':
        await botService.sendMessage(
          telegramId,
          `The ${msg} command does not exist.`
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
          telegramId,
          'OpenAI API services temporarily down.'
        );
        break;
      case 'TELEGRAM_SERVICE_DOWN':
        await botService.sendMessage(
          telegramId,
          'Telegram Bot API services temporarily down.'
        );
        break;
      case 'DESCRIPTION_INSUFFICIENT':
        await botService.sendMessage(
          telegramId,
          'Please elaborate the image you want to generate.'
        );
        break;
      case 'EXCEEDED_IMG_GEN_LIMIT':
        await botService.sendMessage(
          telegramId,
          'At max ten images can be generated per query.'
        );
        break;
      case 'BOT_ALREADY_STARTED':
        await botService.sendMessage(
          telegramId,
          'Hephaestus is already running.'
        );
        break;
      case 'INTERNAL_SERVER_ERROR':
      default:
        console.log(e);
        console.log(e.message);
        await botService.sendMessage(
          telegramId,
          'We have experienced unknown internal error. Hephaestus will shortly be back in service.'
        );
        break;
    }
    res.send(e.message);
  }
};
