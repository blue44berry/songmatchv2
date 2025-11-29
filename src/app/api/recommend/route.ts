import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SONG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    songs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          reason: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'artist'],
      },
    },
  },
  required: ['songs'],
};

export async function POST(req: NextRequest) {
  try {
    const moodProfile = await req.json(); // what /api/analyze returned

    const prompt = `
You are a music curator and playlist expert.

User mood profile:
${JSON.stringify(moodProfile, null, 2)}

Based on this mood, energy, and context_tags, suggest 8–12 REAL, well-known songs 
that match this vibe. Use a mix of English and Hindi/Bollywood if appropriate.

Rules:
- Songs must be real (no made-up artists or tracks).
- Prefer tracks that are available on major streaming platforms.
- Match the emotional tone AND energy (e.g. chill + sad, party + high energy).
- Include some variety (not all from one artist).

Return ONLY JSON that matches the schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: SONG_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error('Empty Gemini response');
    }

    const json = JSON.parse(response.text);
    return NextResponse.json(json);
  } catch (err) {
    console.error('recommend error', err);
    return NextResponse.json({ songs: [] }, { status: 200 });
  }
}
