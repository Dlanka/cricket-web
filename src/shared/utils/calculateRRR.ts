export const calculateRRR = (
  runsRemaining: number,
  ballsRemaining: number,
  ballsPerOver: number,
) => {
  if (ballsRemaining <= 0 || ballsPerOver <= 0) return null;
  return runsRemaining / (ballsRemaining / ballsPerOver);
};
