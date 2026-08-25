<script setup lang="ts">
import { ref } from 'vue';

import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  ConfigProvider,
  InputNumber,
  Popconfirm,
  Popover,
  Switch,
  Tooltip,
} from '@arvin-studio/ui';

/** Tooltip 受控模式演示 */
const tooltipOpen = ref(false);
/** Popover 受控模式演示 */
const popoverOpen = ref(false);

/** Tooltip 的 12 个方向，用于循环展示 placement 用法 */
const tooltipPlacements = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
] as const;

/** Popconfirm 最近一次操作结果（演示 confirm / cancel 事件） */
const popconfirmResult = ref('未操作');
/** Popconfirm 受控模式演示 */
const popconfirmOpen = ref(false);

const onConfirm = () => {
  popconfirmResult.value = '已确认';
};

const onCancel = () => {
  popconfirmResult.value = '已取消';
};

/** Alert 最近一次关闭信息（演示 closable 的 @close 事件） */
const alertCloseResult = ref('未关闭');
const onAlertClose = () => {
  alertCloseResult.value = '已关闭（触发 @close）';
};
</script>

<template>
  <ConfigProvider>
    <!-- <SpaceCompact>
      <Button type="primary"> Button </Button>
      <SpaceAddon> $ </SpaceAddon>
    </SpaceCompact>
    <Space separator="=">
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
      <Button color="pink" :loading="false" variant="solid">按钮</Button>
    </Space> -->
    <!-- <Input :maxlength="1" />
    <InputPassword />
    <InputOTP />
    <InputSearch /> -->
    <InputNumber />
    <CheckboxGroup>
      <Checkbox>sss</Checkbox>
      <Checkbox>sss</Checkbox>
    </CheckboxGroup>
    <Switch />
    <!-- <TextArea /> -->

    <hr />

    <!-- ==================== Tooltip 用法 ==================== -->
    <h3>Tooltip</h3>

    <h4>基础用法（title prop，默认 hover 触发 + top 方向）</h4>
    <div class="row">
      <Tooltip title="prompt text">
        <Button>基础 Tooltip</Button>
      </Tooltip>
      <Tooltip title="默认打开" default-open>
        <Button>defaultOpen</Button>
      </Tooltip>
    </div>

    <h4>#title 插槽</h4>
    <div class="row">
      <Tooltip>
        <template #title><b>粗体标题</b> · 插槽内容</template>
        <Button>#title 插槽</Button>
      </Tooltip>
    </div>

    <h4>placement 十二个方向</h4>
    <div class="row">
      <Tooltip
        v-for="p in tooltipPlacements"
        :key="p"
        :placement="p"
        :title="`placement: ${p}`"
      >
        <Button>{{ p }}</Button>
      </Tooltip>
    </div>

    <h4>arrow 箭头控制</h4>
    <div class="row">
      <Tooltip title="无箭头" :arrow="false">
        <Button>arrow=false</Button>
      </Tooltip>
      <Tooltip
        title="箭头指向中心"
        :arrow="{ pointAtCenter: true }"
        placement="bottom"
      >
        <Button>pointAtCenter</Button>
      </Tooltip>
    </div>

    <h4>trigger 触发方式</h4>
    <div class="row">
      <Tooltip title="click 触发" trigger="click">
        <Button>click</Button>
      </Tooltip>
      <Tooltip title="focus 触发" trigger="focus">
        <Button>focus</Button>
      </Tooltip>
      <Tooltip title="右键触发" trigger="contextMenu">
        <Button>contextMenu</Button>
      </Tooltip>
      <Tooltip title="hover + focus 组合" :trigger="['hover', 'focus']">
        <Button>hover + focus</Button>
      </Tooltip>
    </div>

    <h4>color 颜色</h4>
    <div class="row">
      <Tooltip title="pink" color="pink">
        <Button>pink</Button>
      </Tooltip>
      <Tooltip title="blue" color="blue">
        <Button>blue</Button>
      </Tooltip>
      <Tooltip title="自定义色 #f50" color="#f50">
        <Button>#f50</Button>
      </Tooltip>
    </div>

    <h4>鼠标延迟</h4>
    <div class="row">
      <Tooltip
        title="进出各延迟 0.5s"
        :mouse-enter-delay="0.5"
        :mouse-leave-delay="0.5"
      >
        <Button>0.5s 延迟</Button>
      </Tooltip>
      <Tooltip title="隐藏即销毁" destroy-on-hidden>
        <Button>destroyOnHidden</Button>
      </Tooltip>
    </div>

    <h4>受控模式（v-model:open）</h4>
    <div class="row">
      <Tooltip v-model:open="tooltipOpen" title="受控 Tooltip">
        <Button>受控 Tooltip</Button>
      </Tooltip>
      <Button @click="tooltipOpen = !tooltipOpen">
        切换（当前：{{ tooltipOpen }}）
      </Button>
    </div>

    <hr />

    <!-- ==================== Popover 用法 ==================== -->
    <h3>Popover</h3>

    <h4>基础用法（title + content prop）</h4>
    <div class="row">
      <Popover title="Title" content="这是 Popover 的内容">
        <Button>基础 Popover</Button>
      </Popover>
      <Popover title="无箭头" content="..." :arrow="false">
        <Button>arrow=false</Button>
      </Popover>
    </div>

    <h4>#title / #content 插槽（内容可放任意节点）</h4>
    <div class="row">
      <Popover>
        <template #title>插槽标题</template>
        <template #content>
          <div class="popover-content">
            <p>插槽内容，可以放任意节点：</p>
            <Button type="primary">内容里的按钮</Button>
          </div>
        </template>
        <Button>插槽用法</Button>
      </Popover>
    </div>

    <h4>trigger 触发方式</h4>
    <div class="row">
      <Popover title="click" content="click 触发" trigger="click">
        <Button>click</Button>
      </Popover>
      <Popover title="focus" content="focus 触发" trigger="focus">
        <Button>focus</Button>
      </Popover>
    </div>

    <h4>placement 方向示例</h4>
    <div class="row">
      <Popover title="bottomRight" content="..." placement="bottomRight">
        <Button>bottomRight</Button>
      </Popover>
      <Popover title="leftTop" content="..." placement="leftTop">
        <Button>leftTop</Button>
      </Popover>
    </div>

    <h4>受控模式（v-model:open）</h4>
    <div class="row">
      <Popover
        v-model:open="popoverOpen"
        title="受控 Popover"
        content="..."
        trigger="click"
      >
        <Button>受控 Popover</Button>
      </Popover>
      <Button @click="popoverOpen = !popoverOpen">
        切换（当前：{{ popoverOpen }}）
      </Button>
    </div>

    <hr />

    <!-- ==================== Popconfirm 用法 ==================== -->
    <h3>Popconfirm</h3>

    <h4>基础用法（默认 click 触发，title + confirm / cancel 事件）</h4>
    <div class="row">
      <Popconfirm
        title="确定删除这条记录吗？"
        @confirm="onConfirm"
        @cancel="onCancel"
      >
        <Button type="primary" danger>删除</Button>
      </Popconfirm>
      <span>最近操作：{{ popconfirmResult }}</span>
    </div>

    <h4>description 描述 + 自定义按钮文字</h4>
    <div class="row">
      <Popconfirm
        title="删除任务"
        description="删除后不可恢复，请谨慎操作"
        ok-text="确认删除"
        cancel-text="再想想"
        @confirm="onConfirm"
      >
        <Button type="primary" danger>危险操作</Button>
      </Popconfirm>
    </div>

    <h4>okType / showCancel</h4>
    <div class="row">
      <Popconfirm title="确定发布？" ok-type="primary" @confirm="onConfirm">
        <Button type="primary">发布</Button>
      </Popconfirm>
      <Popconfirm
        title="只保留确定按钮"
        :show-cancel="false"
        @confirm="onConfirm"
      >
        <Button>showCancel=false</Button>
      </Popconfirm>
    </div>

    <h4>自定义图标 / 插槽</h4>
    <div class="row">
      <Popconfirm title="自定义图标" icon="❓" @confirm="onConfirm">
        <Button>icon prop</Button>
      </Popconfirm>
      <Popconfirm @confirm="onConfirm">
        <template #title>插槽标题</template>
        <template #description>插槽描述，可放任意节点</template>
        <template #icon>⚠️</template>
        <Button>插槽用法</Button>
      </Popconfirm>
    </div>

    <h4>placement / disabled / 受控（v-model:open）</h4>
    <div class="row">
      <Popconfirm title="bottom 方向" placement="bottom" @confirm="onConfirm">
        <Button>bottom</Button>
      </Popconfirm>
      <Popconfirm title="禁用状态" disabled @confirm="onConfirm">
        <Button disabled>disabled</Button>
      </Popconfirm>
      <Popconfirm
        v-model:open="popconfirmOpen"
        title="受控 Popconfirm"
        @confirm="onConfirm"
      >
        <Button>受控</Button>
      </Popconfirm>
      <Button @click="popconfirmOpen = !popconfirmOpen">
        切换（当前：{{ popconfirmOpen }}）
      </Button>
    </div>

    <hr />

    <!-- ==================== Alert 用法 ==================== -->
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
      <Alert title="可关闭的 Alert，点右上角 ×" closable @close="onAlertClose" />
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
  </ConfigProvider>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.popover-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}
</style>
