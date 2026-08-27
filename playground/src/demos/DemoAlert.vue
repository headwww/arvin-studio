<script setup lang="ts">
import { ref } from 'vue';

import {
  Alert,
  Button,
} from '@arvin-studio/ui';

/** Alert 最近一次关闭信息（演示 closable 的 @close 事件） */
const alertCloseResult = ref('未关闭');
const onAlertClose = () => {
  alertCloseResult.value = '已关闭（触发 @close）';
};
</script>

<template>
    <section id="demo-alert" class="demo-section">
      <h3>Alert</h3>

      <h4>基础用法（四种 type + showIcon）</h4>
      <div class="col">
        <Alert
          type="success"
          title="成功提示"
          description="这是一条成功提示"
          show-icon
        />
        <Alert
          type="info"
          title="信息提示"
          description="这是一条信息提示"
          show-icon
        />
        <Alert
          type="warning"
          title="警告提示"
          description="这是一条警告提示"
          show-icon
        />
        <Alert
          type="error"
          title="错误提示"
          description="这是一条错误提示"
          show-icon
        />
      </div>

      <h4>只有标题 / 不带图标</h4>
      <div class="col">
        <Alert title="只有标题的 Alert（默认 info 类型、无图标）" />
        <Alert
          type="warning"
          title="标题 + 描述"
          description="描述内容，未开启 showIcon 不带图标"
        />
      </div>

      <h4>可关闭（closable + @close 事件）</h4>
      <div class="col">
        <Alert
          title="可关闭的 Alert，点右上角 ×"
          closable
          @close="onAlertClose"
        />
        <Alert title="自定义关闭图标" closable>
          <template #closeIcon>✕</template>
        </Alert>
        <span>最近操作：{{ alertCloseResult }}</span>
      </div>

      <h4>action 操作区</h4>
      <div class="col">
        <Alert
          type="info"
          title="更新通知"
          description="有新版本可用，点击查看详情。"
          show-icon
        >
          <template #action>
            <Button type="link">查看详情</Button>
          </template>
        </Alert>
      </div>

      <h4>自定义图标（icon prop / #icon 插槽）</h4>
      <div class="col">
        <Alert
          type="success"
          title="icon prop"
          description="通过 icon 替换默认图标"
          show-icon
          icon="🎉"
        />
        <Alert type="warning" title="#icon 插槽" show-icon>
          <template #icon>⚠️</template>
        </Alert>
      </div>

      <h4>banner 顶部公告模式</h4>
      <div class="col">
        <Alert banner title="Banner 公告（默认 warning 类型 + 默认显示图标）" />
        <Alert banner type="info" title="可关闭的 Banner" closable />
      </div>

      <h4>variant 变体（filled / outlined）</h4>
      <div class="col">
        <Alert
          type="success"
          title="filled 变体"
          description="实心背景"
          variant="filled"
          show-icon
        />
        <Alert
          type="success"
          title="outlined 变体"
          description="描边样式"
          variant="outlined"
          show-icon
        />
      </div>

      <h4>title / description 插槽</h4>
      <div class="col">
        <Alert type="info" show-icon>
          <template #title><b>粗体插槽标题</b></template>
          <template #description>插槽描述，可放任意节点</template>
        </Alert>
      </div>
    </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}
</style>
