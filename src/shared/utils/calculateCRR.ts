export const calculateCRR = (runs: number, balls: number, ballsPerOver: number) => {
  if (balls <= 0 || ballsPerOver <= 0) return 0;
  return runs / (balls / ballsPerOver);
};
