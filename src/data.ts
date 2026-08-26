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
    Acoustic: ["commissioned/acoustic/Roundabout.mp3"],
    Orchestral: ["commissioned/orchestral/Villian.mp3"],
  },
  original: {
    Acoustic: [
      "original/acoustic/Cowboy Crossing.mp3",
      "original/acoustic/Easy Drifter.mp3",
      "original/acoustic/Espionage.mp3",
      "original/acoustic/Ghost Town.mp3",
      "original/acoustic/Halloween Mischief.mp3",
      "original/acoustic/Llega el Rey.mp3",
      "original/acoustic/Minor Infractions.mp3",
      "original/acoustic/The Instigator Variation.mp3",
      "original/acoustic/The Instigator.mp3",
    ],
    Orchestral: [
      "original/orchestral/Alarms Triggered.mp3",
      "original/orchestral/Ascend.mp3",
      "original/orchestral/Breach Protocol.mp3",
      "original/orchestral/Escape The Compound.mp3",
      "original/orchestral/Extraction Operation.mp3",
      "original/orchestral/Falling.mp3",
      "original/orchestral/Stealth Takeout.mp3",
      "original/orchestral/The Jester.mp3",
      "original/orchestral/Wicked Waltz.mp3",
    ],
    Piano: [
      "original/piano/Falling.wav",
      "original/piano/Gentle Goodbye.wav",
      "original/piano/Memory.wav",
    ],
    Rock: [
      "original/rock/Inadvertent.mp3",
      "original/rock/Spies.mp3",
      "original/rock/Suspended.mp3",
    ],
  },
};

// Helper to clean up titles and extract style if present in parentheses
function parseTrackInfoFromPath(path: string) {
  const raw = decodeURIComponent(path.split("/").pop()?.replace(/\.\w+$/, "") || "Unknown Track");
  const match = raw.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { title: match[1].trim(), style: match[2].trim() };
  }
  return { title: raw, style: undefined };
}

export const tracks: Record<string, TrackInfo[]> = {
  original: [],
  commissioned: [],
};

// Flatten and parse
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
