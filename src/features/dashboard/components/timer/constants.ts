// TODO: 추후 api로 전환
export const SUBJECTS = [
  '국어',
  '수학',
  '영어',
  '과학',
  '사회',
  '예체능',
  '논술',
];

export const formatHHMMSS = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};
