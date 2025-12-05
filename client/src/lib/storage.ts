export const checkDownloadLimit = (): boolean => {
  const LIMIT = 5;
  const KEY_COUNT = 'famral_download_count';
  const KEY_DATE = 'famral_download_date';

  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(KEY_DATE);
  let count = parseInt(localStorage.getItem(KEY_COUNT) || '0', 10);

  if (lastDate !== today) {
    // Reset if it's a new day
    count = 0;
    localStorage.setItem(KEY_DATE, today);
  }

  if (count >= LIMIT) {
    return false;
  }

  localStorage.setItem(KEY_COUNT, (count + 1).toString());
  return true;
};
