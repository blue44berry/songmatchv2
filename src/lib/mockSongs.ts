// lib/mockSongs.ts
// Merge ideas from your mockData.ts & mood.html SONG_DATABASE. 

export type Song = {
    id: string;
    title: string;
    artist: string;
    album?: string;
    coverUrl?: string;
  };
  
  type MockSong = Song & {
    moods: string[];
    energy: 'low' | 'medium' | 'high';
    tags: string[];
  };
  
  // A starter DB: you can expand by copy-pasting entries from your old mockData.ts & mood.html.
  export const SONG_DATABASE: MockSong[] = [
    {
      id: '1',
      title: 'The Night We Met',
      artist: 'Lord Huron',
      album: "Strange Trails",
      moods: ['sad', 'nostalgic', 'romantic'],
      energy: 'low',
      tags: ['breakup', 'memory', 'slow'],
      coverUrl: 'https://picsum.photos/seed/lordhuron/64/64',
    },
    {
      id: '2',
      title: 'Yellow',
      artist: 'Coldplay',
      album: 'Parachutes',
      moods: ['nostalgic', 'romantic'],
      energy: 'low',
      tags: ['longing', 'soft'],
      coverUrl: 'https://picsum.photos/seed/yellow/64/64',
    },
    {
      id: '3',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      moods: ['party', 'happy'],
      energy: 'high',
      tags: ['dance', 'pop', 'fun'],
      coverUrl: 'https://picsum.photos/seed/dualipa/64/64',
    },
    {
      id: '4',
      title: 'Stronger',
      artist: 'Kanye West',
      album: 'Graduation',
      moods: ['motivational', 'party'],
      energy: 'high',
      tags: ['gym', 'confidence'],
      coverUrl: 'https://picsum.photos/seed/kanye/64/64',
    },
    // 👉 Add more from your existing SONG_DATABASE and mood.html curated list
  ];
  
  export function findMatchingSongs(
    moodAndTags: string[],
    energy: 'low' | 'medium' | 'high',
    contextTags: string[]
  ): Song[] {
    const search = moodAndTags.map((s) => s.toLowerCase());
  
    const scored = SONG_DATABASE.map((song) => {
      let score = 0;
  
      if (song.energy === energy) score += 2;
  
      song.moods.forEach((m) => {
        if (search.includes(m.toLowerCase())) score += 2;
      });
  
      song.tags.forEach((t) => {
        if (search.includes(t.toLowerCase())) score += 1;
      });
  
      return { song, score };
    });
  
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.song)
      .slice(0, 10);
  }
  