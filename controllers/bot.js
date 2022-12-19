const axios = require("axios");
require("dotenv").config();

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const fetchResponse = (query) => {
    try {
        console.log(query);
        return {
            response: "Hey, there!"
        }
    } catch (e) {
        return e;
    }
};

const sendMessage = async (chatId, response) => {
    try {
        return await axios.post(TELEGRAM_API+"/sendMessage", {
            chat_id: chatId,
            text: response
        });
    } catch (e) {
        console.log(e);
        return e;
    }
};

module.exports = {
    fetchResponse,
    sendMessage
};