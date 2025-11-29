'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/Button';
import { MoodResults } from '@/components/MoodResults';
import { MoodProfile, Song } from '@/types';

export default function HomePage() {
  const [caption, setCaption] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<{
    profile: MoodProfile;
    songs: Song[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (!caption && !imageBase64) {
      setError('Please add a caption or upload a photo to start.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // 1. → Call mood analysis API
      const profileRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          imageBase64,
          mimeType: imageMime,
        }),
      });

      if (!profileRes.ok) {
        const txt = await profileRes.text();
        throw new Error(`Analyze API failed: ${txt}`);
      }

      const profile: MoodProfile = await profileRes.json();

      // 2. → Call recommendations API
      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!recRes.ok) {
        const txt = await recRes.text();
        throw new Error(`Recommend API failed: ${txt}`);
      }

      const { songs }: { songs: Song[] } = await recRes.json();

      setResult({ profile, songs });
    } catch (err) {
      console.error(err);
      setError('Failed to analyze your vibe. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCaption('');
    setImageBase64(null);
    setImageMime(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-gradient-x opacity-50" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-gradient-x opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="flex items-start justify-between mb-16 relative">
          <div className="flex-1 flex flex-col items-center text-center w-full">
            <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold text-5xl md:text-6xl tracking-tighter mb-4">
              VibeMatch 2.0
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light">
              AI-powered soundtrack curator for your Instagram vibes.
            </p>
          </div>
        </header>

        {/* Main Body */}
        {!result ? (
          <main className="max-w-2xl mx-auto">
            <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                  1. Upload your photo (optional)
                </label>

                <ImageUpload
                  onImageSelect={(base64, mime) => {
                    setImageBase64(base64);
                    setImageMime(mime);
                    setError(null);
                  }}
                  onClear={() => {
                    setImageBase64(null);
                    setImageMime(null);
                  }}
                />
              </div>

              {/* Caption Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                  2. Write your caption or feelings
                </label>

                <textarea
                  className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none h-32"
                  placeholder="e.g. Late night drive with no destination..."
                  value={caption}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              {/* Error + Analyze Button */}
              <div className="flex flex-col gap-4">

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  className="w-full h-14 text-lg"
                  disabled={!caption && !imageBase64}
                >
                  Find Perfect Songs
                </Button>
              </div>
            </div>
          </main>
        ) : (
          <MoodResults
            profile={result!.profile}
            songs={result!.songs}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
