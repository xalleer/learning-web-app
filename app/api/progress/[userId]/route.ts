import { errorResponse, json, options } from '@/server/http';
import { getProgressCollection } from '@/server/mongo';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const collection = await getProgressCollection();
    const row = await collection.findOne({ userId: params.userId || 'default' }, { projection: { _id: 0, payload: 1 } });
    return json(200, { progress: row?.payload || null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const body = await request.json();
    const userId = params.userId || 'default';
    const collection = await getProgressCollection();
    await collection.updateOne(
      { userId },
      { $set: { payload: body.progress, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    return json(200, { ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
