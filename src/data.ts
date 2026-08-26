export const AUDIO_BASE = "files/audio/";

export type TrackInfo = {
  title: string;
  path: string;
  category: string;
  group: string;
  style?: string;
};

const rawAudioData = {
  commissioned: {
    Acoustic: ["commissioned/acoustic/Roundabout (Jazz).mp3"],
    Orchestral: ["commissioned/orchestral/Villain (Fantasy).mp3"],
  },
  original: {
    Acoustic: [
      "original/acoustic/Cowboy Crossing (Country).mp3",
      "original/acoustic/Easy Drifter (Country).mp3",
      "original/acoustic/Espionage (Jazz).mp3",
      "original/acoustic/Ghost Town (Country).mp3",
      "original/acoustic/Halloween Mischief.mp3",
      "original/acoustic/Llega el Rey (Latin Jazz).mp3",
      "original/acoustic/Minor Infractions (Jazz).mp3",
      "original/acoustic/The Instigator Variation (Polka).mp3",
      "original/acoustic/The Instigator (Polka).mp3",
    ],
    Orchestral: [
      "original/orchestral/Alarms Triggered (Action).mp3",
      "original/orchestral/Ascend (Fantasy).mp3",
      "original/orchestral/Breach Protocol (Action).mp3",
      "original/orchestral/Escape The Compound (Action).mp3",
      "original/orchestral/Extraction Operation (Action).mp3",
      "original/orchestral/Falling (Fantasy).mp3",
      "original/orchestral/Stealth Takeout (Action).mp3",
      "original/orchestral/The Jester (Fantasy).mp3",
      "original/orchestral/Wicked Waltz (Dark).mp3",
    ],
    Piano: [
      "original/piano/Falling.wav",
      "original/piano/Gentle Goodbye.wav",
      "original/piano/Memory.wav",
    ],
    Rock: [
      "original/rock/Inadvertent (Hard).mp3",
      "original/rock/Spies (Hard).mp3",
      "original/rock/Suspended (Indie).mp3",
    ],
  },
};

function parseTrackInfoFromPath(path: string) {
  let raw = decodeURIComponent(path.split("/").pop() || "Unknown Track");
  raw = raw.replace(/\.[^/.]+$/, "").trim(); 
  
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return { title: match[1].trim(), style: match[2].trim() };
  }
  return { title: raw, style: undefined };
}

export const tracks: Record<string, TrackInfo[]> = {
  original: [],
  commissioned: [],
};

Object.entries(rawAudioData).forEach(([group, categories]) => {
  Object.entries(categories).forEach(([category, paths]) => {
    paths.forEach((path) => {
      const { title, style } = parseTrackInfoFromPath(path);
      tracks[group].push({
        title,
        style,
        path,
        category,
        group,
      });
    });
  });
});

export const allTracks: TrackInfo[] = [...tracks.original, ...tracks.commissioned];

