export type StoryPickerBounds = { left: number; top: number; right: number; bottom: number };

/** Leave the live player's complete switcher untouched by story navigation. */
export function storyGestureRegions(width: number, height: number, picker: StoryPickerBounds) {
  const left = Math.max(0, picker.left - 6);
  const top = Math.max(0, picker.top - 6);
  const right = Math.min(width, picker.right + 6);
  const bottom = Math.min(height, picker.bottom + 6);
  return [
    { left: 0, top: 0, width, height: top },
    { left: 0, top: bottom, width, height: Math.max(0, height - bottom) },
    { left: 0, top, width: left, height: bottom - top },
    { left: right, top, width: Math.max(0, width - right), height: bottom - top },
  ];
}
