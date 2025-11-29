import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

// Reuse your existing MoodProfile shape (simplified here)
type MoodProfile = {
  mood: 'nostalgic' | 'happy' | 'sad' | 'romantic' | 'motivational' | 'party' | 'chill';
  energy: 'low' | 'medium' | 'high';
  context_tags: string[];
  confidence: number;
  description: string;
  color_hex: string;
  spotify_config: {
    target_valence: number;
    target_energy: number;
    target_danceability: number;
    seed_genres: string[];
  };
};

// This schema is adapted from your existing geminiService.ts MOOD_SCHEMA :contentReference[oaicite:5]{index=5}
const MOOD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mood: {
      type: Type.STRING,
      enum: ['nostalgic', 'happy', 'sad', 'romantic', 'motivational', 'party', 'chill'],
    },
    energy: {
      type: Type.STRING,
      enum: ['low', 'medium', 'high'],
    },
    context_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    confidence: {
      type: Type.NUMBER,
    },
    description: {
      type: Type.STRING,
    },
    color_hex: {
      type: Type.STRING,
    },
    spotify_config: {
      type: Type.OBJECT,
      properties: {
        target_valence: { type: Type.NUMBER },
        target_energy: { type: Type.NUMBER },
        target_danceability: { type: Type.NUMBER },
        seed_genres: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['target_valence', 'target_energy', 'target_danceability', 'seed_genres'],
    },
  },
  required: ['mood', 'energy', 'context_tags', 'description', 'color_hex', 'spotify_config'],
};

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const { caption, imageBase64, mimeType } = await req.json();

    if (!caption && !imageBase64) {
      return NextResponse.json(
        { error: 'Provide at least a caption or an image.' },
        { status: 400 }
      );
    }

    const parts: any[] = [];

    if (caption) {
      parts.push({
        text: `The user provided this Instagram-style caption: "${caption}". Analyze tone, vibe, and emotion.`,
      });
    }

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      });
      parts.push({
        text: 'Analyze the visual mood, lighting, context, and scene of this image.',
      });
    }

    parts.push({
      text: 'Return a JSON mood profile suitable for music recommendation.',
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: MOOD_SCHEMA,
        systemInstruction:
          'You are an expert aesthetic curator and music supervisor. Analyze photos and captions to determine emotional/atmospheric vibe and map it to Spotify audio features.',
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const profile = JSON.parse(response.text) as MoodProfile;

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Analyze API error:', error);

    // Safe fallback (chill vibe) if AI fails
    const fallback: MoodProfile = {
      mood: 'chill',
      energy: 'medium',
      context_tags: ['fallback', 'relax'],
      confidence: 0.5,
      description: 'We could not analyze the vibe, so we defaulted to a chill medium-energy mood.',
      color_hex: '#6b7280',
      spotify_config: {
        target_valence: 0.5,
        target_energy: 0.5,
        target_danceability: 0.5,
        seed_genres: ['chill', 'pop'],
      },
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
