/**
 * Shared between the courtyard scene and the section that renders its wording.
 * Kept in its own module so the section can read the thresholds without pulling
 * the whole three.js bundle in eagerly.
 */
export const MARKER_Z = [-40, -66, -92];
export const CAM_START = 6;
export const CAM_TRAVEL = 120;

/** How far ahead of a marker it becomes the current step. */
const READ_AHEAD = 25;

export const STEP_THRESHOLDS = MARKER_Z.map(
  (z) => (CAM_START - (z + READ_AHEAD)) / CAM_TRAVEL
);
