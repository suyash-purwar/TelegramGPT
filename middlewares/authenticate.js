import httpStatus from 'http-status';
import User from './../models/users.js';
import * as botService from './../services/bot.service.js';

export default async function authenticate(req, res, next) {
  const telegramId = req.body.message?.chat.id;
  const text = req.body.message?.text;
  if (!telegramId) {
    botService.sendMessage(req.body.edited_message.chat.id, 'Responses are not provided for edited messages.');
    res.sendStatus(httpStatus.OK);
    return;
  }
  if (text.startsWith('/start')) {
    return next();
  }
  const user = await User.findOne({ telegram_id: telegramId });
  console.log(telegramId);
  if (!user?.is_active) {
    botService.sendMessage(telegramId, 'Hephaestus is not active right now. Send /start command to activate.')
    res.sendStatus(httpStatus.OK);
    return;
  }
  return next();
}