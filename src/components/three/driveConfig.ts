/** Shared timing for the hero drive so every element scrolls in lockstep. */
export const ROAD_SPEED = 15;

/** Driver eye height in a sedan, in metres. */
export const EYE_HEIGHT = 1.25;

/** Length of the recycling corridor: objects wrap from behind the camera back into the fog. */
export const WRAP_SPAN = 280;

/** Anything past this z is behind the camera and safe to recycle. */
export const WRAP_BEHIND = 18;

export function wrapZ(z: number) {
  return z > WRAP_BEHIND ? z - WRAP_SPAN : z;
}
