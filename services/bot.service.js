import * as openai from './../apis/openai.api.js';
import * as telegram from './../apis/telegram.api.js';
import User from './../models/users.js';
import Analytics from '../models/analytics.js';
import SecureToken from '../utils/secure-token.js';

export const processMsg = async (telegramId, messageId, msg, userInfo) => {
  console.log(userInfo, messageId);
  if (msg.startsWith('/start')) {
    await startCommand(telegramId);
  } else if (msg.startsWith('/off')) {
    await offCommand(telegramId);
  } else if (msg.startsWith('/about')) {
    await aboutCommand(telegramId);
  } else if (msg.startsWith('/update')) {
    await updateCommand(telegramId, messageId, msg);
  } else if (msg.startsWith('/image')) {
    await imageCommand(telegramId, msg, userInfo);
  } else {
    await textCommand(telegramId, msg, userInfo);
  }
};

export const sendMessage = async (telegramId, msg) => {
  await telegram.sendTextualMessage(telegramId, msg);
};

const startCommand = async (telegramId) => {
  let msg_response;
  const user = await User.findOne({ telegram_id: telegramId }, 'is_active account_deactivation_time');
  // If the user's row exists and is_active = true
  if (user?.is_active) throw new Error('BOT_ALREADY_STARTED'); 
  // If user's row exists and is_active = false
  if (user && !user?.is_active) {
    // Calculate the no. of days between the last time bot was activated and current time
    // account_activation_time holds the last time account was activated 
    // If no. of days > 1, refill the basic tier quota
    const isItAnotherDay = ((new Date() - new Date(user.account_deactivation_time)) / 86400000);
    const updatedData = {
      is_active: true,
    }
    if (isItAnotherDay >= 1.0) {
      console.log(isItAnotherDay);
      updatedData.basic_quota = {
        text: 15,
        image: 5
      }
      updatedData.account_activation_time = new Date();
    }
    await User.findOneAndUpdate({ telegram_id: telegramId }, { $set: updatedData });
    msg_response = 'Hephaestus is back to your service! 🔥😄';
  } else {
    const newUser = new User({ telegram_id: telegramId });
    await newUser.save();
    const newAnalytics = new Analytics({
      telegram_id: telegramId,
      records: [{
        sentAt: new Date(),
        msg_type: 'text'
      }]
    });
    await newAnalytics.save();
    msg_response = 'Hephaestus Bot is now at your service. By default, you have a basic account with which you can send 15 text response type and 5 image type requests per day.\n\nYou can be free of this limit by upgrading to premium account and it\'s completely free. Send /upgrade-account command to initiate the process.\n\nSend /help command to get a list of commands.'
  }
  await telegram.sendTextualMessage(telegramId, msg_response);
};

const offCommand = async (telegramId) => {
  const msg_response = 'Sad to see you go! 😢\nI can always be revived by the /start command.';
  await User.findOneAndUpdate(
    { telegram_id: telegramId },
    { 
      $set: { 
        is_active: false,
        account_deactivation_time: new Date()
      }
    }
  );
  await telegram.sendTextualMessage(telegramId, msg_response);
}

const aboutCommand = async (telegramId) => {
  const msg_response =
    "Hephaestus is a chatbot which internally uses Open AI's most advanced AI - ChatGPT and DALL-E.\nThis bot is an open source project (https://www.github.com/suyash-purwar/hephaestus) and contributions are always welcome. If you liked this bot, do give it a star on github! This project was started by Suyash Purwar (https://www.github.com/suyash-purwar).";
  await telegram.sendTextualMessage(telegramId, msg_response);
};

const updateCommand = async (telegramId, messageId, msg) => {
  const token = msg.split(' ')[1];
  if (!token) throw new Error('EMPTY_TOKEN');
  const isValid = await openai.verifyToken(token);
  if (!isValid) throw new Error('INVALID_TOKEN');
  const encryptedToken = SecureToken.encryptToken(token);
  await User.findOneAndUpdate(
    { telegram_id: telegramId },
    {
      $set: {
        account_type: 'premium',
        account_type_update_time: new Date(),
        openai_api_token: encryptedToken
      }
    }
  );
  let msg_response = 'Hurrayyy! 🎊\nYou\'re a premium user now. Hephaestus is at your service indefinitely. 😄';
  await telegram.sendTextualMessage(telegramId, msg_response);
  await telegram.deleteMessage(telegramId, messageId);
}

const textCommand = async (telegramId, msg, userInfo) => {
  if (msg[0] === '/') throw new Error('COMMAND_DOES_NOT_EXIST');
  const isBasicAccount = (userInfo.accountType === 'basic');
  if (isBasicAccount && userInfo.textQuota === 0) throw new Error('EXHAUSTED_BASIC_TIER_TEXT_QUOTA');
  const openaiToken = userInfo.apiToken ?
    SecureToken.decryptToken(userInfo.apiToken) :
    process.env.OPENAI_SECRET_KEY;
  const { msg_response, token_usage } = await openai.generateTextResponse(openaiToken, msg);
  await telegram.sendTextualMessage(telegramId, msg_response);
  if (isBasicAccount) {
    await User.findOneAndUpdate({ telegram_id: telegramId }, { 'basic_quota.text': userInfo.textQuota - 1 });
  }
  await Analytics.findOneAndUpdate(
    { telegram_id: telegramId },
    { 
      $push: { 
        records: {
          sentAt: new Date(),
          msg_type: 'text',
          api_tokens_used: token_usage,
          account_type: userInfo.accountType
        }
      }
    }
  );
};

const imageCommand = async (telegramId, msg, userInfo) => {
  if (msg.length < 10) throw new Error('DESCRIPTION_INSUFFICIENT');
  const query = msg.slice(7);
  let imgCount = 1;
  const isBasicAccount = (userInfo.accountType === 'basic');
  if (isBasicAccount && userInfo.imageQuota === 0) throw new Error('EXHAUSTED_BASIC_TIER_IMAGE_QUOTA')
  if (!isNaN(parseInt(msg[msg.length - 1]))) {
    if (!isNaN(parseInt(msg[msg.length - 2]))) {
      throw new Error('EXCEEDED_IMG_GEN_LIMIT');
    } else {
      imgCount = +msg[msg.length - 1];
    }
  }
  if (isBasicAccount && imgCount > 1) throw new Error('EXCEEDED_BASIC_TIER_IMG_GEN_LIMIT'); 
  const openaiToken = userInfo.apiToken ?
    SecureToken.decryptToken(userInfo.apiToken) :
    process.env.OPENAI_SECRET_KEY;
  const urls = await openai.generateImageResponse(openaiToken, query, imgCount);
  await telegram.sendImageMessage(telegramId, urls);
  if (isBasicAccount) {
    await User.findOneAndUpdate({ telegram_id: telegramId }, { 'basic_quota.image': userInfo.imageQuota - 1 });
  }
  await Analytics.findOneAndUpdate(
    { telegram_id: telegramId },
    { 
      $push: {
        records: {
          sentAt: new Date(),
          msg_type: 'image',
          account_type: userInfo.accountType
        }
      }
    }
  );
};
