export interface MoodProfile {
  mood: string;
  energy: 'low' | 'medium' | 'high';
  context_tags: string[];
  confidence?: number;
  description?: string;
  color_hex?: string;
  spotify_config?: {
    target_valence: number;
    target_energy: number;
    target_danceability: number;
    seed_genres: string[];
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  externalUrl?: string;
  previewUrl?: string;
  matchReason?: string;
}
