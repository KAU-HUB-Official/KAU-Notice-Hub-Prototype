import OpenAI from "openai";

let cachedClient: OpenAI | null | undefined;

export function getOpenAIClient(): OpenAI | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}
