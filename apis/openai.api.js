const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const openai = new OpenAIApi(configuration);

const generateTextResponse = async (query) => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: query,
      max_tokens: 50,
      temperature: 0,
    });
    return response.data.choices[0].text;
  } catch (e) {
    switch (e.message) {
      default:
        console.log(e.message);
        throw new Error('OPENAI_SERVICE_DOWN');
    }
  }
};

const generateImageResponse = async (query, imgCount) => {
  try {
    const response = await openai.createImage({
      prompt: query,
      n: imgCount,
      size: '512x512',
    });
    const urls = response.data.data.map((obj) => obj.url);
    return urls;
  } catch (e) {
    console.log(e);
    switch (e.message) {
      default:
        console.log(e.message);
        throw new Error('OPENAI_SERVICE_DOWN');
    }
  }
};

module.exports = {
  generateTextResponse,
  generateImageResponse,
};
