export const compareSemver = (
  v1: string,
  v2: string,
  order: 'ascending' | 'descending' = 'descending'
) => {
  // Strip the 'v' prefix and split into numbers
  const [maj1, min1, pat1] = v1.replace(/^v/, '').split('.').map(Number);
  const [maj2, min2, pat2] = v2.replace(/^v/, '').split('.').map(Number);

  const diff = maj2 - maj1 || min2 - min1 || pat2 - pat1;
  return order === 'ascending' ? -diff : diff;
};
