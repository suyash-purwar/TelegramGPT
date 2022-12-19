const axios = require("axios");
const { Configuration, OpenAIApi} = require("openai");
require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET_KEY
});
const openai = new OpenAIApi(configuration);
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const fetchResponse = async (query) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: query,
            max_tokens: 50,
            temperature: 0
        });
        return response.data.choices[0].text;
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