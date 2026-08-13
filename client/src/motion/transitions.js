export const motionEase = [0.22, 1, 0.36, 1];

export const motionDurations = {
  fast: 0.16,
  standard: 0.2,
  page: 0.28,
};

export const transitions = {
  fast: { duration: motionDurations.fast, ease: motionEase },
  standard: { duration: motionDurations.standard, ease: motionEase },
  page: { duration: motionDurations.page, ease: motionEase },
  reduced: { duration: 0.01 },
};

export const springs = {
  drawer: { type: 'spring', stiffness: 360, damping: 34 },
  counter: { type: 'spring', stiffness: 480, damping: 24, duration: 0.24 },
  confirmation: { type: 'spring', stiffness: 420, damping: 28, duration: 0.22 },
  depth: { type: 'spring', stiffness: 90, damping: 24, mass: 0.45 },
};

export const withReducedMotion = (reduceMotion, transition) =>
  reduceMotion ? transitions.reduced : transition;
