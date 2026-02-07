export const placeholderImages = [
  "/placeholders/scene-1.svg",
  "/placeholders/scene-2.svg",
  "/placeholders/scene-3.svg",
  "/placeholders/scene-4.svg",
  "/placeholders/scene-5.svg",
];

export function getPlaceholderImage(index = 0) {
  const safeIndex = index % placeholderImages.length;
  return placeholderImages[safeIndex];
}
