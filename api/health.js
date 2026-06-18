import { pingMongo } from './_lib/mongo.js';
import { handleError, handleOptions, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

    const mongo = await pingMongo();
    return sendJson(res, 200, {
      ok: true,
      mongo,
      env: {
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        mongoDb: process.env.MONGODB_DB || 'fsdev_roadmap',
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}
