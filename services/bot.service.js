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
  } else if (msg.startsWith('/howtoupgrade')) {
    await howToUpgradeCommand(telegramId);    
  } else if (msg.startsWith('/upgrade')) {
    await upgradeCommand(telegramId, messageId, msg);
  } else if (msg.startsWith('/switchtobasic')) {
    await switchToBasicCommand(telegramId);
  } else if (msg.startsWith('/switchtopremium')) {
    await switchToPremiumCommand(telegramId);
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
    // Check if the user is activating the bot on the same day of deactivation or not.
    // If yes, do not restore the basic quota
    // If no, restore the basic quota
    const updatedData = {
      is_active: true,
    }

    if (user.account_deactivation_time) {
      const lastDeactivationTime = new Date(user.account_deactivation_time);
      const currentTime = new Date();
      if (
        currentTime.getFullYear() > lastDeactivationTime.getFullYear() ||
        currentTime.getMonth() > lastDeactivationTime.getMonth() ||
        currentTime.getDay() > lastDeactivationTime.getDay()
      ) {
        updatedData.basic_quota = {
          text: 15,
          image: 5
        }
      }
    }

    await User.findOneAndUpdate({ telegram_id: telegramId }, { $set: updatedData });
    msg_response = 'Hephaestus is back to your service! 🔥😄';
  } else {
    // When user does not exist
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
};

const aboutCommand = async (telegramId) => {
  const msg_response =
    "Hephaestus is a chatbot which internally uses Open AI's most advanced AI - ChatGPT and DALL-E.\nThis bot is an open source project (https://www.github.com/suyash-purwar/hephaestus) and contributions are always welcome. If you liked this bot, do give it a star on github! This project was started by Suyash Purwar (https://www.github.com/suyash-purwar).";
  await telegram.sendTextualMessage(telegramId, msg_response);
};

const howToUpgradeCommand = async (telegramId) => {
  const msg_response = `
Follow the steps in order to upgrade your account to premium plan:

1. Create your account on OpenAI by registering yourself here https://platform.openai.com/signup
2. Go onto https://platform.openai.com/account/api-keys
3. Click on 'Generate new secret key' and copy the generated secret key.
4. Send a message to us in this format 👉 /upgrade [secret key here]

Note: To maintain privacy of your secret key, we encrypt the secret key before storing in our database.
  `;
  await telegram.sendTextualMessage(telegramId, msg_response);
};

const upgradeCommand = async (telegramId, messageId, msg) => {
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
        openai_api_token: encryptedToken
      }
    }
  );
  let msg_response = 'Hurrayyy! 🎊\nYou\'re a premium user now. Hephaestus is at your service indefinitely. 😄';
  await telegram.sendTextualMessage(telegramId, msg_response);
  await telegram.deleteMessage(telegramId, messageId);
};

const switchToBasicCommand = async (telegramId) => {
  const { 
    account_type: accountType ,
    account_downgrade_time: accountDowngradeTime
  } = await User.findOne({ telegram_id: telegramId }, 'account_type account_downgrade_time');
  if (accountType === 'basic') throw new Error('ALREADY_BASIC_ACCOUNT');
  const updatedData = {
    account_type: 'basic',
    account_downgrade_time: new Date()
  };
  if (accountDowngradeTime) {
    const currentTime = new Date();
    if (
      currentTime.getFullYear() > accountDowngradeTime.getFullYear() ||
      currentTime.getMonth() > accountDowngradeTime.getMonth() ||
      currentTime.getDay() > accountDowngradeTime.getDay()
    ) {
      updatedData.basic_quota = {
        image: 15,
        text: 5
      };
    }
  }
  await User.findOneAndUpdate(
    { telegram_id: telegramId },
    { $set: updatedData }
  );
  const msg_response = 'Your account is downgraded to basic plan. You can always switch back to your premium plan by sending /switchtopremium command.';
  await telegram.sendTextualMessage(telegramId, msg_response);
};

const switchToPremiumCommand = async (telegramId) => {
  const {
    account_type: accountType,
    openai_api_token: openaiToken
  } = await User.findOne({ telegram_id: telegramId}, 'account_type openai_api_token');
  if (accountType === 'premium') throw new Error('ALREADY_PREMIUM_ACCOUNT');
  if (accountType === 'basic' && !openaiToken) throw new Error('UNABLE_TO_SWITCH_TO_PREMIUM');
  await User.findOneAndUpdate(
    { telegram_id: telegramId },
    {
      $set: {
        account_type: 'premium'
      }
    }
  );
  await telegram.sendTextualMessage(telegramId, 'Your account is upgraded back to premium plan.');
};

const textCommand = async (telegramId, msg, userInfo) => {
  if (msg[0] === '/') throw new Error('COMMAND_DOES_NOT_EXIST');
  const isBasicAccount = (userInfo.accountType === 'basic');
  if (isBasicAccount && userInfo.textQuota === 0) throw new Error('EXHAUSTED_BASIC_TIER_TEXT_QUOTA');
  const openaiToken = userInfo.apiToken ?
    SecureToken.decryptToken(userInfo.apiToken) :
    process.env.OPENAI_SECRET_KEY;
  const { msg_response, token_usage } = await openai.generateTextResponse(openaiToken, isBasicAccount, msg);
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
