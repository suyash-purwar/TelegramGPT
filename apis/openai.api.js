import { Configuration, OpenAIApi } from 'openai';

export const generateTextResponse = async (query) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: query,
      max_tokens: 50,
      temperature: 0,
    });
    return {
      msg_response: response.data.choices[0].text,
      token_usage: response.data.usage.total_tokens
    };
  } catch (e) {
    switch (e.message) {
      default:
        console.log(e.message);
        console.log(e);
        throw new Error('OPENAI_SERVICE_DOWN');
    }
  }
};

export const generateImageResponse = async (query, imgCount) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY,
    });
    const openai = new OpenAIApi(configuration);
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
        console.log(e);
        throw new Error('OPENAI_SERVICE_DOWN');
    }
  }
};
