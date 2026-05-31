export function cleanDecorativeLabel(label: string) {
  return label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
}
