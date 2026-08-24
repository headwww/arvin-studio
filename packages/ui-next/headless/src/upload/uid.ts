const now = Date.now();
let index = 0;

export default function uid() {
  return `headless-upload-${now}-${++index}`;
}
