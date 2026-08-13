export type KoreanParticlePair =
  | '을/를'
  | '이/가'
  | '은/는'
  | '와/과'
  | '아/야'
  | '이랑/랑'
  | '으로/로';

type FinalSound = 'none' | 'rieul' | 'other';

const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const HANGUL_FINAL_SOUND_COUNT = 28;
const RIEUL_FINAL_SOUND_INDEX = 8;

const NUMBER_FINAL_SOUNDS: Record<string, FinalSound> = {
  '0': 'other',
  '1': 'rieul',
  '2': 'none',
  '3': 'other',
  '4': 'none',
  '5': 'none',
  '6': 'other',
  '7': 'rieul',
  '8': 'rieul',
  '9': 'none',
};

const RIEUL_ENDING_ENGLISH_LETTERS = new Set(['L', 'R']);
const OTHER_BATCHIM_ENDING_ENGLISH_LETTERS = new Set([
  'F',
  'H',
  'M',
  'N',
  'S',
  'X',
]);

const PARTICLES: Record<
  Exclude<KoreanParticlePair, '으로/로'>,
  { withBatchim: string; withoutBatchim: string }
> = {
  '을/를': { withBatchim: '을', withoutBatchim: '를' },
  '이/가': { withBatchim: '이', withoutBatchim: '가' },
  '은/는': { withBatchim: '은', withoutBatchim: '는' },
  '와/과': { withBatchim: '과', withoutBatchim: '와' },
  '아/야': { withBatchim: '아', withoutBatchim: '야' },
  '이랑/랑': { withBatchim: '이랑', withoutBatchim: '랑' },
};

const finalSoundOf = (word: string): FinalSound => {
  const lastCharacter = Array.from(word.normalize('NFC')).at(-1);
  if (!lastCharacter) return 'none';

  const codePoint = lastCharacter.codePointAt(0);
  if (
    codePoint != null &&
    codePoint >= HANGUL_SYLLABLE_START &&
    codePoint <= HANGUL_SYLLABLE_END
  ) {
    const finalSoundIndex =
      (codePoint - HANGUL_SYLLABLE_START) % HANGUL_FINAL_SOUND_COUNT;
    if (finalSoundIndex === 0) return 'none';
    return finalSoundIndex === RIEUL_FINAL_SOUND_INDEX ? 'rieul' : 'other';
  }

  const numberFinalSound = NUMBER_FINAL_SOUNDS[lastCharacter];
  if (numberFinalSound) return numberFinalSound;

  if (/^[a-z]$/i.test(lastCharacter)) {
    const upperCaseLetter = lastCharacter.toUpperCase();
    if (RIEUL_ENDING_ENGLISH_LETTERS.has(upperCaseLetter)) return 'rieul';
    return OTHER_BATCHIM_ENDING_ENGLISH_LETTERS.has(upperCaseLetter)
      ? 'other'
      : 'none';
  }

  return 'none';
};

export const withKoreanParticle = (
  word: string,
  pair: KoreanParticlePair
): string => {
  const finalSound = finalSoundOf(word);
  if (pair === '으로/로') {
    return `${word}${finalSound === 'other' ? '으로' : '로'}`;
  }

  const particle = PARTICLES[pair];
  return `${word}${
    finalSound === 'none' ? particle.withoutBatchim : particle.withBatchim
  }`;
};
