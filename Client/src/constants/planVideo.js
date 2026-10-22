/*
 * Mirrors server/validator/planVideos.js and server/constants.js ->
 * VIDEO_TRIMESTERS. The server checks again.
 */

export const PLAN_VIDEO_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 30,
  DESCRIPTION_MAX: 300,
};

// "all" is not a video trimester: a whole-pregnancy video lists all three.
export const VIDEO_TRIMESTERS = ["first", "second", "third"];

export const VIDEO_TRIMESTER_LABELS = {
  first: "1st Trimester",
  second: "2nd Trimester",
  third: "3rd Trimester",
};

export const VIDEO_TRIMESTER_SHORT = {
  first: "1st",
  second: "2nd",
  third: "3rd",
};

export const PLAN_VIDEO_SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
];
