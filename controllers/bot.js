const axios = require("axios");
const { Configuration, OpenAIApi} = require("openai");
require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET_KEY
});
const openai = new OpenAIApi(configuration);
const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

const handleQuery = async (text) => {
    let response;
    if (text.startsWith('/image')) {
        if (text.length < 10) throw new Error("DESCRIPTION_INSUFFICIENT");
        const query = text.slice(7);
        let imgCount = 1;
        if (!isNaN(parseInt(text[text.length-1]))) {
            if (!isNaN(parseInt(text[text.length-2]))) {
                throw new Error("EXCEEDED_IMG_GEN_LIMIT");
            } else {
                imgCount = +text[text.length-1];
                console.log(imgCount);
            }
        }
        const urls = await generateImageResponse(query, imgCount);
        response = {
            data: urls,
            type: 'image'
        };
    } else if (text.startsWith('/about')) {
        const about = "Hephaestus is a chatbot which internally uses Open AI's most advanced AI - ChatGPT and DALL-E.\nThis bot is an open source project (https://www.github.com/suyash-purwar/hephaestus) and contributions are always welcome. If you liked this bot, do give it a star on github! This project was started by Suyash Purwar (https://www.github.com/suyash-purwar).";
        response = {
            data: about,
            type: 'text'
        };
    } else {
        if (text[0] === '/') throw new Error("COMMAND_DOES_NOT_EXIST");
        console.log("Textual response");
        const textualResponse = await generateTextResponse(text);
        response = {
            data: textualResponse,
            type: 'text'
        }
    }
    return response;
};

const generateTextResponse = async (query) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: query,
            max_tokens: 50,
            temperature: 0
        });
        return response.data.choices[0].text;
    } catch (e) {
        switch (e.message) {
            default:
                console.log(e.message);
                throw new Error("OPENAI_SERVICE_DOWN");
        }
    }
};

const generateImageResponse = async (query, imgCount) => {
    try {
        const response = await openai.createImage({
            prompt: query,
            n: imgCount,
            size: "512x512"
        });
        const urls = response.data.data.map(obj => obj.url);
        return urls;
    } catch (e) {
        console.log(e);
        switch(e.message) {
            default:
                console.log(e.message);
                throw new Error("OPENAI_SERVICE_DOWN");
        }
    }
};

const sendTextualMessage = async (chatId, response) => {
    try {
        return await axios.post(TELEGRAM_API+"/sendMessage", {
            chat_id: chatId,
            text: response
        });
    } catch (e) {
        switch(e.message) {
            default:
                console.log(e);
                throw new Error("TELEGRAM_SERVICE_DOWN");
        }
    }
};

const sendImageMessage = async (chatId, response) => {
    try {
        response.forEach(async url => {
            await axios.post(TELEGRAM_API+'/sendPhoto', {
                chat_id: chatId,
                photo: url
            });
        });
    } catch (e) {
        switch(e.message) {
            default:
                console.log(e.message);
                throw new Error("TELEGRAM_SERVICE_DOWN");
        }
    }
};

module.exports = {
    handleQuery,
    generateTextResponse,
    sendTextualMessage,
    sendImageMessage
};