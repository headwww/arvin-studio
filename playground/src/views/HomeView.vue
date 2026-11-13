<template>
  <section class="page">
    <h2>首页</h2>
    <p>
      左侧菜单不是手写的，它由 <code>src/router/routes.ts</code> 自动生成 ——
      路由和菜单是同一份数据，永远不会对不上。
    </p>

    <h3>新增一个功能只要两步</h3>
    <p>
      1. 在 <code>src/views/</code> 下新建一个 <code>.vue</code>，逻辑写在那里：
    </p>
    <pre>playground/src/views/UserView.vue</pre>
    <p>2. 在 <code>src/router/routes.ts</code> 里加一条记录：</p>
    <pre>
{
  path: '/user',
  name: 'User',
  component: () =&gt; import('../views/UserView.vue'),
  meta: { title: '用户管理', icon: UserOutlined, order: 4 },
},</pre>
    <p>
      保存后左侧菜单立刻多出「用户管理」一项，点进去就是你的页面。菜单顺序由
      <code>meta.order</code> 决定，图标直接从
      <code>@arvin-studio/icons</code> 里引组件。
    </p>

    <h3>几个约定</h3>
    <p>
      · 想做成可展开的子菜单：给这条记录加 <code>children</code>，里面每一项都会
      出现在子菜单里（示例见「组件示例」）。
    </p>
    <p>
      · 只想要路由、不进菜单（详情页）就设
      <code>meta.hideInMenu: true</code>
    </p>
    <p>
      · 菜单项的 key 就是路由的完整路径，点击菜单时走的就是
      <code>router.push(path)</code>，所以刷新页面、直接贴 URL
      进去都能正常高亮。
    </p>
  </section>
</template>
