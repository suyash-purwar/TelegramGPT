const axios = require("axios");
const { query } = require("express");
const { Configuration, OpenAIApi} = require("openai");
require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET_KEY
});
const openai = new OpenAIApi(configuration);
const TELEGRAM_API = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}`;

const handleQuery = async (text) => {
    let response;
    switch (text) {
        case '/image':
            // Call generateImageResponse
            console.log("Generates images");
            const urls = generateImageResponse(text);
            response = {
                data: urls,
                type: 'image'
            };
            break;
        case '/about':
            // Return chatbot info
            console.log("Chatbot info");
            const about = "Hephaestus is a chatbot which internally uses Open AI's most advanced AI - ChatGPT and DALL-E.\nThis bot is an open source project (https://www.github.com/suyash-purwar/hephaestus) and contributions are always welcome. If you liked this bot, do give it a star on github! This project was started by Suyash Purwar (https://www.github.com/suyash-purwar).";
            response = {
                data: about,
                type: 'text'
            }
            break;
        default:
            if (text[0] === '/') throw new Error("COMMAND_DOES_NOT_EXIST");
            // Call generateTextResponse
            console.log("Textual response");
            const textualResponse = await generateTextResponse(text);
            console.log(text);
            console.log(textualResponse);
            response = {
                data: textualResponse,
                type: 'text'
            }
            break;
    }
    return response;
}

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

const generateImageResponse = async (query) => {
    // Call DALL-E
}

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

module.exports = {
    handleQuery,
    generateTextResponse,
    sendTextualMessage
};