import { getProgressCollection } from '../_lib/mongo.js';
import { handleError, handleOptions, readBody, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (handleOptions(req, res)) return;

    const userId = String(req.query.userId || 'default');
    const collection = await getProgressCollection();

    if (req.method === 'GET') {
      const row = await collection.findOne({ userId }, { projection: { _id: 0, payload: 1 } });
      return sendJson(res, 200, { progress: row?.payload || null });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      await collection.updateOne(
        { userId },
        { $set: { payload: body.progress, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return handleError(res, error);
  }
}
