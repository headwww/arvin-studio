// oxlint-disable no-unused-vars
import * as _as_ui from '@arvin-studio/ui/components';

const as_ui = (_as_ui as any).components_exports ?? _as_ui;

async function extractStyleText(
  customTheme?: (node: ReturnType<typeof h>) => ReturnType<typeof h>,
) {
  console.log('000000', as_ui);
}

export async function buildStyle() {
  const styleText = await extractStyleText();
}
