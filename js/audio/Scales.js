/**
 * SYNTH::HELIX - Musical Scales
 * ==============================
 * Koleksi tangga nada musik untuk berbagai mood dan genre
 */

// Semitone intervals dari root note
// Contoh: Pentatonic [0, 2, 4, 7, 9] berarti:
// - 0 = root note (misal C)
// - 2 = 2 semitone di atas root (D)
// - 4 = 4 semitone di atas root (E)
// - dst...

export const SCALES = {
  // ============ COMMON SCALES ============
  pentatonic: {
    name: 'Pentatonic Major',
    description: 'Happy, ethereal, safe - cocok untuk pemula',
    intervals: [0, 2, 4, 7, 9],
    mood: 'happy',
  },
  
  pentatonicMinor: {
    name: 'Pentatonic Minor',
    description: 'Sad, bluesy, soulful',
    intervals: [0, 3, 5, 7, 10],
    mood: 'melancholic',
  },
  
  major: {
    name: 'Major (Ionian)',
    description: 'Bright, happy, uplifting',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    mood: 'happy',
  },
  
  minor: {
    name: 'Natural Minor (Aeolian)',
    description: 'Sad, dramatic, emotional',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    mood: 'sad',
  },

  // ============ BLUES & JAZZ ============
  blues: {
    name: 'Blues',
    description: 'Soulful, expressive, emotional',
    intervals: [0, 3, 5, 6, 7, 10],
    mood: 'soulful',
  },
  
  harmonicMinor: {
    name: 'Harmonic Minor',
    description: 'Exotic, dramatic, Middle Eastern vibes',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    mood: 'exotic',
  },

  // ============ WORLD SCALES ============
  japanese: {
    name: 'Japanese (In Sen)',
    description: 'Zen, mysterious, oriental',
    intervals: [0, 1, 5, 7, 10],
    mood: 'mysterious',
  },
  
  hirajoshi: {
    name: 'Hirajoshi',
    description: 'Traditional Japanese koto scale',
    intervals: [0, 2, 3, 7, 8],
    mood: 'serene',
  },
  
  arabian: {
    name: 'Arabian (Double Harmonic)',
    description: 'Middle Eastern, exotic, dramatic',
    intervals: [0, 1, 4, 5, 7, 8, 11],
    mood: 'exotic',
  },

  // ============ MODERN / EXPERIMENTAL ============
  chromatic: {
    name: 'Chromatic',
    description: 'All 12 notes - untuk advance user',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    mood: 'experimental',
  },
  
  wholeTone: {
    name: 'Whole Tone',
    description: 'Dreamy, floating, impressionistic',
    intervals: [0, 2, 4, 6, 8, 10],
    mood: 'dreamy',
  },
};

/**
 * Convert scale degree to frequency
 * @param {number} degree - Note position in scale (0-indexed)
 * @param {string} scaleName - Name of scale to use
 * @param {number} baseFreq - Base frequency (default A3 = 220Hz)
 * @param {number} octaveOffset - Octave adjustment
 * @returns {number} Frequency in Hz
 */
export function getFrequency(degree, scaleName = 'pentatonic', baseFreq = 220, octaveOffset = 0) {
  const scale = SCALES[scaleName];
  if (!scale) {
    console.warn(`Scale "${scaleName}" not found, using pentatonic`);
    return getFrequency(degree, 'pentatonic', baseFreq, octaveOffset);
  }

  const intervals = scale.intervals;
  const octave = Math.floor(degree / intervals.length);
  const noteIndex = degree % intervals.length;
  const semitones = intervals[noteIndex] + (octave * 12) + (octaveOffset * 12);
  
  // Equal temperament formula: f = baseFreq * 2^(semitones/12)
  return baseFreq * Math.pow(2, semitones / 12);
}

/**
 * Get all scale names for UI dropdown
 */
export function getScaleNames() {
  return Object.entries(SCALES).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description,
    mood: value.mood,
  }));
}

export default SCALES;
