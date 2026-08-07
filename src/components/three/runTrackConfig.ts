/**
 * Shared between the track scene and the section that renders its wording, so
 * the section can read the thresholds without importing the three.js bundle.
 */
export const TRACK_START = 8;
export const TRACK_END = -128;
export const STATION_Z = [-26, -66, -106];

/** How far ahead of a station it becomes the current one. */
const READ_AHEAD = 26;

export const STATION_THRESHOLDS = STATION_Z.map(
  (z) => (TRACK_START - (z + READ_AHEAD)) / (TRACK_START - TRACK_END)
);
