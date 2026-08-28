import type { App } from 'vue';

import InternalLayout, { Content, Footer, Header } from './layout';
import Sider, { useSiderCtx } from './Sider';

export const useLayoutSider = useSiderCtx;

export type { BasicProps as LayoutProps } from './layout';
export type { SiderProps } from './Sider';

(InternalLayout as any).install = (app: App) => {
  app.component(InternalLayout.name, InternalLayout);
  app.component(Header.name, Header);
  app.component(Footer.name, Footer);
  app.component(Content.name, Content);
  app.component(Sider.name, Sider);
  return app;
};

export const LayoutHeader = Header;
export const LayoutFooter = Footer;
export const LayoutContent = Content;
export const LayoutSider = Sider;

export default InternalLayout;
