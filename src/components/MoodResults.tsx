import React from 'react';
import { MoodProfile, Song } from '@/types';

interface MoodResultsProps {
  profile: MoodProfile;
  songs: Song[];
  onReset: () => void;
}

export const MoodResults: React.FC<MoodResultsProps> = ({
  profile,
  songs,
  onReset,
}) => {
  const safeConfidence = profile.confidence ?? 0.75; // default 75% if missing

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Mood Header Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 mb-8 text-center border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${profile.color_hex}20 0%, #18181b 100%)`,
        }}
      >
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-white uppercase bg-white/10 rounded-full mb-4 border border-white/10">
            Vibe Detected
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 capitalize tracking-tight">
            {profile.mood}
          </h2>
          <p className="text-lg text-gray-300 italic mb-6">
            "{profile.description}"
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {profile.context_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-black/40 rounded-lg text-sm text-gray-300 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex justify-center items-center gap-6 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  profile.energy === 'high'
                    ? 'bg-red-500'
                    : profile.energy === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              />
              Energy:{' '}
              <span className="text-gray-200 capitalize">{profile.energy}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Confidence:{' '}
              <span className="text-gray-200">
                {Math.round(safeConfidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Background Decorative Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: profile.color_hex }}
        />
      </div>

      {/* Song List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 pl-1">
          Curated Tracks
        </h3>

        <div className="grid gap-4">
          {songs.map((song, idx) => {
            const query = encodeURIComponent(`${song.title} ${song.artist}`);
            const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;
            const spotifySearchUrl = `https://open.spotify.com/search/${query}`;
            const key = `${song.title}-${song.artist}-${idx}`; // ✅ unique key

            return (
              <div
                key={key}
                className="bg-surface hover:bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4 transition-all group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Cover / fallback tile */}
                <div className="w-16 h-16 rounded-md bg-gray-800 flex-shrink-0 overflow-hidden relative">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.album || song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-secondary/40">
                      <span className="text-xl font-semibold text-white">
                        {song.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* you can add a play icon here later */}
                  </div>
                </div>

                {/* Text info */}
                <div className="flex-grow min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {song.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                    {song.album && <> • {song.album}</>}
                  </p>
                  {song.matchReason && (
                    <p className="text-xs text-primary mt-1 opacity-80">
                      {song.matchReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-3">
                  {/* Copy */}
                  <button
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy song name"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${song.title} - ${song.artist}`,
                      )
                    }
                  >
                    📋
                  </button>

                  {/* YouTube */}
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    title="Open on YouTube"
                  >
                    ▶️
                  </a>

                  {/* Spotify */}
                  <a
                    href={spotifySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-500 hover:text-green-400 transition-colors"
                    title="Open on Spotify"
                  >
                    🎧
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Analyze another vibe
          </button>
        </div>
      </div>
    </div>
  );
};
