import keywords from '../../assets/db.json';

export const loadKeywordData = async () => {
  // Bundled JSON import keeps data on-device for offline usage.
  return keywords;
};
