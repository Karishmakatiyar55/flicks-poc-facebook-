export function storySwipeDirection(dx: number, dy: number, width: number): -1 | 0 | 1 {
  if (Math.abs(dx) < Math.max(45, width * 0.18) || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

export function storyTapDirection(x: number, width: number): -1 | 1 {
  return x < width / 2 ? -1 : 1;
}
