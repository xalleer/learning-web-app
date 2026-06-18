import { errorResponse, json, options } from '@/server/http';
import { pingMongo } from '@/server/mongo';

export const runtime = 'nodejs';

export function OPTIONS() {
  return options();
}

export async function GET() {
  try {
    const mongo = await pingMongo();
    return json(200, {
      ok: true,
      mongo,
      env: {
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        mongoDb: process.env.MONGODB_DB || 'fsdev_roadmap',
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
