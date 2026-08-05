type StyleCollector = null | { push: (styleText: string) => void };

let collector: StyleCollector = null;

export function setStyleCollector(next: StyleCollector) {
  collector = next;
}

export function collectStyleText(styleText: string) {
  collector?.push(styleText);
}
