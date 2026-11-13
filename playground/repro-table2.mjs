/* 临时诊断脚本：用 jsdom + vite ssrLoadModule 在 Node 里挂载 Table 复现组件，抓真实报错。
   不属于项目代码，诊断完删除。 */
import { JSDOM } from '/Users/shuwen/WorkSpace-Web/arvin-studio/node_modules/.pnpm/jsdom@28.1.0/node_modules/jsdom/lib/api.js';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

const { window } = dom;
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLDivElement',
  'Element',
  'Node',
  'SVGElement',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'CustomEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'MutationObserver',
]) {
  const value = window[key];
  if (value !== undefined) {
    try {
      Object.defineProperty(globalThis, key, {
        value:
          typeof value === 'function' &&
          /^(getComputedStyle|requestAnimationFrame|cancelAnimationFrame)$/.test(key)
            ? value.bind(window)
            : value,
        configurable: true,
        writable: true,
      });
    } catch {
      /* ignore */
    }
  }
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
globalThis.ResizeObserver = window.ResizeObserver;
globalThis.Option = globalThis.Option || { name: 'OptionStub' };
globalThis.CSS = globalThis.CSS || {
  escape: (value) =>
    String(value).replace(/[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, (ch) => `\\${ch}`),
  supports: () => false,
};
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }));

const logs = [];
const origWarn = console.warn;
const origError = console.error;
console.warn = (...args) => {
  logs.push(['warn', args]);
  origWarn('[repro warn]', ...args);
};
console.error = (...args) => {
  logs.push(['error', args]);
  origError('[repro error]', ...args);
};

const { createServer } = await import(
  '/Users/shuwen/WorkSpace-Web/arvin-studio/playground/node_modules/vite/dist/node/index.js'
);

const server = await createServer({
  root: '/Users/shuwen/WorkSpace-Web/arvin-studio/playground',
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  const vue = await import(
    '/Users/shuwen/WorkSpace-Web/arvin-studio/playground/node_modules/vue/index.mjs'
  );
  const mod = await server.ssrLoadModule('/src/repro/TableRepro.tsx');
  const app = vue.createApp(mod.default);
  app.config.warnHandler = (msg, instance, trace) => {
    logs.push(['vue-warn', [msg, trace]]);
  };
  app.config.errorHandler = (err, instance, info) => {
    logs.push(['vue-error', [err, info]]);
    origError('[vue error]', info, err && err.stack ? err.stack : err);
  };
  app.mount('#app');

  await sleep(300);
  await vue.nextTick();
  await sleep(700);
  await vue.nextTick();
  await sleep(700);

  const doc = window.document;
  console.log('\n=== RESULT ===');
  console.log('th count:', doc.querySelectorAll('th').length);
  console.log('tbody tr count:', doc.querySelectorAll('tbody tr').length);
  const slotDiv = doc.querySelector('.as-table-slots');
  console.log('column slot placeholders:', slotDiv ? slotDiv.children.length : 'n/a');
  console.log('warn count:', logs.filter((l) => l[0] === 'vue-warn').length);
  console.log('error count:', logs.filter((l) => l[0] === 'vue-error').length);

  const seen = new Set();
  for (const [type, payload] of logs) {
    const key =
      type +
      ':' +
      JSON.stringify(String(payload[0] && (payload[0].message || payload[0])));
    if (seen.has(key) || (type !== 'vue-warn' && type !== 'vue-error')) continue;
    seen.add(key);
    if (type === 'vue-warn') {
      console.log('\n[VUE WARN]', payload[0]);
      console.log(payload[1]);
    } else {
      console.log('\n[VUE ERROR]', payload[1], payload[0] && payload[0].message);
    }
  }

  const rootInstance = app._instance;
  const stack = rootInstance ? [rootInstance] : [];
  while (stack.length) {
    const inst = stack.pop();
    const name = inst.type && (inst.type.name || inst.type.__name || inst.type.__file);
    if (name && String(name).toLowerCase().includes('table')) {
      const provided = inst.provides && inst.provides.$asTable;
      if (provided && provided.reactData) {
        console.log(
          '\ninstance:',
          name,
          '\n  staticColumns:',
          provided.reactData.staticColumns.length,
          '\n  tableColumn:',
          provided.reactData.tableColumn.length,
          '\n  collectColumn:',
          provided.internalData.collectColumn.length,
          '\n  tableFullColumn:',
          provided.internalData.tableFullColumn.length,
        );
      }
    }
    const walk = (vnode) => {
      if (!vnode) return;
      if (vnode.component) stack.push(vnode.component);
      if (Array.isArray(vnode.children)) vnode.children.forEach(walk);
      else if (vnode.children && typeof vnode.children === 'object') {
        Object.values(vnode.children).forEach((child) => {
          if (Array.isArray(child)) child.forEach(walk);
        });
      }
    };
    walk(inst.subTree);
  }
} catch (error) {
  origError('[repro fatal]', error);
} finally {
  await server.close();
  dom.window.close();
}
