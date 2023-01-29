import express from 'express';
import * as dotenv from 'dotenv';
import routes from './router/bot.router.js';
import connectBD from './db/db.js';

const app = express();

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

app.use(express.json());
app.use('/api/v1', routes);

app.listen(process.env.PORT, async () => {
  console.log(`Bot running on http://localhost:${process.env.PORT}. ✅`);
  await connectBD();
});
