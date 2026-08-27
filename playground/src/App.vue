<script setup lang="ts">
import { ref } from 'vue';

import {
  Alert,
  Anchor,
  Avatar,
  AvatarGroup,
  Badge,
  BadgeRibbon,
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  CollapsePanel,
  ConfigProvider,
  Input,
  InputNumber,
  Popconfirm,
  Popover,
  Radio,
  RadioButton,
  RadioGroup,
  Space,
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

/** Anchor 当前高亮链接（演示 change 事件） */
const anchorCurrent = ref('');
const onAnchorChange = (link: string) => {
  anchorCurrent.value = link;
};

/** 全局 Anchor 导航：按组件分组指向各演示区块 */
const demoItems = [
  { key: 'demo-basic', href: '#demo-basic', title: '基础组件' },
  { key: 'demo-tooltip', href: '#demo-tooltip', title: 'Tooltip' },
  { key: 'demo-popover', href: '#demo-popover', title: 'Popover' },
  { key: 'demo-popconfirm', href: '#demo-popconfirm', title: 'Popconfirm' },
  { key: 'demo-alert', href: '#demo-alert', title: 'Alert' },
  { key: 'demo-avatar', href: '#demo-avatar', title: 'Avatar' },
  { key: 'demo-button', href: '#demo-button', title: 'Button' },
  { key: 'demo-checkbox', href: '#demo-checkbox', title: 'Checkbox' },
  { key: 'demo-input', href: '#demo-input', title: 'Input' },
  { key: 'demo-inputnumber', href: '#demo-inputnumber', title: 'InputNumber' },
  { key: 'demo-radio', href: '#demo-radio', title: 'Radio' },
  { key: 'demo-space', href: '#demo-space', title: 'Space' },
  { key: 'demo-badge', href: '#demo-badge', title: 'Badge' },
  { key: 'demo-collapse', href: '#demo-collapse', title: 'Collapse' },
] as const;

/** Avatar 演示用图片地址 */
const avatarSrc = 'https://i.pravatar.cc/100?img=12';
/** 必然加载失败的地址，用于演示图片错误回退 */
const badSrc = 'https://example.com/not-exist.png';
/** 返回 false 阻止默认回退（展示破图），可自行处理错误 */
const onAvatarError = () => {
  return false;
};

/** Checkbox 演示状态 */
const checkboxChecked = ref(true);
const checkedValues = ref(['A', 'C']);
const checkedValues2 = ref(['apple']);
const checkedValues3 = ref<string[]>([]);
const checkboxOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true },
];

/** Input 演示状态 */
const inputValue = ref('');

/** InputNumber 演示状态 */
const numValue = ref(3);

/** Radio 演示状态 */
const radioValue = ref('A');
const radioValue2 = ref('mon');
const radioValue3 = ref('1');
const radioValue4 = ref('x');
const radioChecked = ref(true);
const radioOptions = [
  { label: '周一', value: 'mon' },
  { label: '周二', value: 'tue' },
  { label: '周三', value: 'wed', disabled: true },
];

/** Badge 演示状态（count 动态增减，观察数字滚动动画） */
const badgeCount = ref(5);
const increaseBadge = () => {
  badgeCount.value += 1;
};
const decreaseBadge = () => {
  badgeCount.value = Math.max(0, badgeCount.value - 1);
};

/** Collapse 演示状态（受控 activeKey + change 事件） */
const collapseActiveKey = ref(['panel-1']);
const onCollapseChange = (keys: string[]) => {
  collapseActiveKey.value = keys;
};
/** Collapse items 配置式（key / label / content） */
const collapseItems = [
  { key: 'c1', label: '手风琴 1', content: '手风琴面板 1 的内容' },
  { key: 'c2', label: '手风琴 2', content: '手风琴面板 2 的内容' },
  { key: 'c3', label: '手风琴 3', content: '手风琴面板 3 的内容' },
];
</script>

<template>
  <ConfigProvider>
    <!-- ==================== 全局 Anchor 导航 ==================== -->
    <div class="demo-anchor-nav">
      <Anchor
        :items="demoItems as any"
        direction="horizontal"
        :offset-top="16"
        :target-offset="120"
        @change="onAnchorChange"
      >
        <template #item="{ title }">
          <span>📍 {{ title }}</span>
        </template>
      </Anchor>
    </div>

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

    <section id="demo-basic" class="demo-section">
      <h3>基础组件</h3>
      <InputNumber />
      <CheckboxGroup>
        <Checkbox>sss</Checkbox>
        <Checkbox>sss</Checkbox>
      </CheckboxGroup>
      <Switch />
      <!-- <TextArea /> -->
    </section>

    <section id="demo-tooltip" class="demo-section">
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
    </section>

    <section id="demo-popover" class="demo-section">
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
    </section>

    <section id="demo-popconfirm" class="demo-section">
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
    </section>

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

    <section id="demo-avatar" class="demo-section">
      <h3>Avatar</h3>

      <h4>基础用法（文字 / 图片 / 图标）</h4>
      <div class="row">
        <Avatar>U</Avatar>
        <Avatar :src="avatarSrc" alt="avatar" />
        <Avatar icon="🧑💻" />
        <Avatar>张三</Avatar>
      </div>

      <h4>size 尺寸（预设 / 数字 / 响应式）</h4>
      <div class="row">
        <Avatar size="small">S</Avatar>
        <Avatar size="medium">M</Avatar>
        <Avatar size="large">L</Avatar>
        <Avatar :size="64">64</Avatar>
        <Avatar :size="{ xs: 24, md: 48, xl: 64 }">R</Avatar>
        <span class="hint">响应式 size：拖动窗口宽度观察变化</span>
      </div>

      <h4>shape 形状</h4>
      <div class="row">
        <Avatar shape="circle">circle</Avatar>
        <Avatar shape="square">square</Avatar>
        <Avatar :size="48" shape="square" :src="avatarSrc" />
      </div>

      <h4>icon 插槽 / gap 文字间距</h4>
      <div class="row">
        <Avatar>
          <template #icon>🎨</template>
        </Avatar>
        <Avatar :size="64" :gap="2">头像文字很长</Avatar>
        <Avatar :size="64" :gap="10">头像文字很长</Avatar>
      </div>

      <h4>图片加载失败回退（onError）</h4>
      <div class="row">
        <Avatar :src="badSrc" alt="加载失败">Fallback</Avatar>
        <Avatar :src="badSrc" alt="阻止回退" :on-error="onAvatarError">
          自定义
        </Avatar>
        <span class="hint">
          左侧失败后回退显示文字；右侧 onError 返回 false 阻止默认回退
        </span>
      </div>

      <h4>AvatarGroup（基础 / max 折叠 + Popover）</h4>
      <div class="row">
        <AvatarGroup>
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar icon="🧑💻" />
          <Avatar :src="avatarSrc" />
          <Avatar>陈</Avatar>
        </AvatarGroup>
      </div>
      <div class="row">
        <AvatarGroup :max="{ count: 3 }">
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
          <Avatar>F</Avatar>
        </AvatarGroup>
        <AvatarGroup
          :max="{
            count: 4,
            popover: { placement: 'bottom', trigger: 'click' },
          }"
        >
          <Avatar>U</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
        </AvatarGroup>
        <span class="hint">
          max 折叠后剩余头像通过 Popover 查看（右侧为 click 触发）
        </span>
      </div>
    </section>

    <section id="demo-button" class="demo-section">
      <h3>Button</h3>

      <h4>type 类型</h4>
      <div class="row">
        <Button>default</Button>
        <Button type="primary">primary</Button>
        <Button type="dashed">dashed</Button>
        <Button type="link">link</Button>
        <Button type="text">text</Button>
      </div>

      <h4>variant / color 变体</h4>
      <div class="row">
        <Button color="pink" variant="solid">pink solid</Button>
        <Button color="blue" variant="outlined">blue outlined</Button>
        <Button color="green" variant="filled">green filled</Button>
        <Button color="gold" variant="dashed">gold dashed</Button>
        <Button variant="text">text</Button>
        <Button variant="link">link</Button>
      </div>

      <h4>size / shape</h4>
      <div class="row">
        <Button size="small">small</Button>
        <Button size="medium">medium</Button>
        <Button size="large">large</Button>
        <Button shape="circle">C</Button>
        <Button shape="round">round</Button>
        <Button shape="square">square</Button>
      </div>

      <h4>状态（disabled / loading / danger / ghost）</h4>
      <div class="row">
        <Button type="primary" disabled>disabled</Button>
        <Button type="primary" loading>loading</Button>
        <Button type="primary" danger>danger</Button>
        <Button ghost>ghost</Button>
        <Button danger>danger default</Button>
      </div>
      <div class="row">
        <Button type="primary" block>block 撑满父容器</Button>
      </div>

      <h4>图标 / iconPlacement / 链接按钮</h4>
      <div class="row">
        <Button type="primary" icon="⭐">icon start</Button>
        <Button type="primary" icon="⭐" icon-placement="end">icon end</Button>
        <Button type="primary" shape="circle" icon="👍" />
        <Button href="https://example.com" target="_blank" type="link">
          链接按钮
        </Button>
      </div>
    </section>

    <section id="demo-checkbox" class="demo-section">
      <h3>Checkbox</h3>

      <h4>基础（v-model:checked）</h4>
      <div class="row">
        <Checkbox v-model:checked="checkboxChecked">
          当前：{{ checkboxChecked }}
        </Checkbox>
        <Checkbox default-checked>默认选中</Checkbox>
        <Checkbox disabled>禁用</Checkbox>
        <Checkbox disabled checked>禁用 + 选中</Checkbox>
      </div>

      <h4>CheckboxGroup（options 配置式，v-model:value）</h4>
      <div class="row">
        <CheckboxGroup
          v-model:value="checkedValues"
          :options="['A', 'B', 'C', 'D']"
        />
        <span>选中：{{ checkedValues }}</span>
      </div>
      <div class="row">
        <CheckboxGroup
          v-model:value="checkedValues2"
          :options="checkboxOptions"
        />
        <span>选中：{{ checkedValues2 }}</span>
      </div>

      <h4>CheckboxGroup（插槽子项）</h4>
      <div class="row">
        <CheckboxGroup v-model:value="checkedValues3">
          <Checkbox value="a">选项 A</Checkbox>
          <Checkbox value="b">选项 B</Checkbox>
          <Checkbox value="c" disabled>选项 C（禁用）</Checkbox>
        </CheckboxGroup>
      </div>
    </section>

    <section id="demo-input" class="demo-section">
      <h3>Input</h3>

      <h4>基础（v-model:value）</h4>
      <div class="row">
        <Input
          v-model:value="inputValue"
          placeholder="请输入内容"
          style="width: 220px"
        />
        <span>值：{{ inputValue }}</span>
      </div>

      <h4>size / disabled / readonly / status</h4>
      <div class="row">
        <Input size="small" placeholder="small" style="width: 140px" />
        <Input placeholder="medium" style="width: 140px" />
        <Input size="large" placeholder="large" style="width: 140px" />
        <Input disabled placeholder="disabled" style="width: 140px" />
        <Input readonly value="只读内容" style="width: 140px" />
        <Input status="error" placeholder="error 状态" style="width: 140px" />
        <Input
          status="warning"
          placeholder="warning 状态"
          style="width: 140px"
        />
      </div>

      <h4>maxlength + showCount / allowClear</h4>
      <div class="row">
        <Input
          :maxlength="10"
          show-count
          placeholder="最多 10 字"
          style="width: 220px"
        />
        <Input
          allow-clear
          default-value="可清除"
          placeholder="allowClear"
          style="width: 220px"
        />
      </div>

      <h4>prefix / suffix 插槽</h4>
      <div class="row">
        <Input placeholder="前缀" style="width: 220px">
          <template #prefix>🔍</template>
        </Input>
        <Input placeholder="后缀" style="width: 220px">
          <template #suffix>@qq.com</template>
        </Input>
      </div>

      <h4>variant 变体</h4>
      <div class="row">
        <Input variant="outlined" placeholder="outlined" style="width: 160px" />
        <Input variant="filled" placeholder="filled" style="width: 160px" />
        <Input
          variant="borderless"
          placeholder="borderless"
          style="width: 160px"
        />
        <Input
          variant="underlined"
          placeholder="underlined"
          style="width: 160px"
        />
      </div>
    </section>

    <section id="demo-inputnumber" class="demo-section">
      <h3>InputNumber</h3>

      <h4>基础（v-model:value）</h4>
      <div class="row">
        <InputNumber v-model:value="numValue" />
        <span>值：{{ numValue }}</span>
      </div>

      <h4>min / max / step / precision</h4>
      <div class="row">
        <InputNumber :min="0" :max="100" :step="5" default-value="50" />
        <InputNumber :precision="2" :step="0.5" default-value="1.5" />
        <span class="hint">支持键盘上下键 / 滚轮 / 步进器调整</span>
      </div>

      <h4>disabled / controls / prefix / suffix</h4>
      <div class="row">
        <InputNumber disabled default-value="3" />
        <InputNumber :controls="false" default-value="7" />
        <InputNumber prefix="¥" suffix="元" default-value="99" />
      </div>
    </section>

    <section id="demo-radio" class="demo-section">
      <h3>Radio</h3>

      <h4>RadioGroup（v-model:value + options）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue" :options="['A', 'B', 'C']" />
        <span>选中：{{ radioValue }}</span>
      </div>

      <h4>options 对象形式（含禁用项）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue2" :options="radioOptions" />
        <span>选中：{{ radioValue2 }}</span>
      </div>

      <h4>RadioButton 按钮样式（optionType / buttonStyle / size）</h4>
      <div class="row">
        <RadioGroup v-model:value="radioValue3" option-type="button">
          <RadioButton value="1">一月</RadioButton>
          <RadioButton value="2">二月</RadioButton>
          <RadioButton value="3">三月</RadioButton>
        </RadioGroup>
      </div>
      <div class="row">
        <RadioGroup
          v-model:value="radioValue4"
          option-type="button"
          button-style="solid"
          size="small"
        >
          <RadioButton value="x">X</RadioButton>
          <RadioButton value="y">Y</RadioButton>
          <RadioButton value="z">Z</RadioButton>
        </RadioGroup>
      </div>

      <h4>单独 Radio（v-model:checked）</h4>
      <div class="row">
        <Radio v-model:checked="radioChecked">开关：{{ radioChecked }}</Radio>
        <Radio disabled>禁用</Radio>
      </div>
    </section>

    <section id="demo-space" class="demo-section">
      <h3>Space</h3>

      <h4>基础（size 预设）</h4>
      <div class="row">
        <Space size="small">
          <Button type="primary">small</Button>
          <Button>按钮</Button>
          <Button>按钮</Button>
        </Space>
        <Space size="large">
          <Button type="primary">large</Button>
          <Button>按钮</Button>
        </Space>
      </div>

      <h4>自定义间距 / wrap 换行</h4>
      <div class="row">
        <Space :size="24">
          <Button>24px 间距</Button>
          <Button>按钮</Button>
        </Space>
      </div>
      <div style="width: 360px">
        <Space :size="[8, 16]" wrap>
          <Button v-for="n in 8" :key="n">按钮 {{ n }}</Button>
        </Space>
      </div>

      <h4>vertical 垂直排列</h4>
      <div class="row">
        <Space vertical>
          <Button>上</Button>
          <Button>中</Button>
          <Button>下</Button>
        </Space>
      </div>

      <h4>separator 分隔符</h4>
      <div class="row">
        <Space separator="|">
          <span>一</span>
          <span>二</span>
          <span>三</span>
        </Space>
        <Space>
          <template #separator><span style="color: #f50">◆</span></template>
          <span>一</span>
          <span>二</span>
          <span>三</span>
        </Space>
      </div>

      <h4>align 对齐</h4>
      <div class="row">
        <Space align="start">
          <Button>start</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
        <Space align="center">
          <Button>center</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
        <Space align="end">
          <Button>end</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
      </div>
    </section>

    <section id="demo-badge" class="demo-section">
      <h3>Badge</h3>

      <h4>count 数字徽标（含 overflowCount / showZero）</h4>
      <div class="row">
        <Badge :count="badgeCount">
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <Button @click="increaseBadge">+1</Button>
        <Button @click="decreaseBadge">-1</Button>
        <Badge :count="0" show-zero>
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <Badge :count="100" :overflow-count="99">
          <Avatar shape="square" size="large">U</Avatar>
        </Badge>
        <span class="hint">
          count 变化带数字滚动动画；100 超出 overflowCount 显示 99+
        </span>
      </div>
      <h4>dot 红点</h4>
      <div class="row">
        <Badge dot>
          <Button>通知</Button>
        </Badge>
        <Badge dot color="green">
          <Button>在线</Button>
        </Badge>
      </div>
      <h4>status 状态点 + text</h4>
      <div class="row">
        <Badge status="success" text="成功" />
        <Badge status="processing" text="处理中" />
        <Badge status="warning" text="警告" />
        <Badge status="error" text="错误" />
        <Badge status="default" text="默认" />
      </div>
      <h4>color 自定义颜色（count / dot / 状态点）</h4>
      <div class="row">
        <Badge :count="6" color="pink">
          <Button>pink</Button>
        </Badge>
        <Badge :count="9" color="#52c41a">
          <Button>自定义色</Button>
        </Badge>
        <Badge dot color="volcano">
          <Button>volcano</Button>
        </Badge>
        <Badge color="gold" text="gold 状态点" />
      </div>
      <h4>#count 插槽（自定义徽标内容）</h4>
      <div class="row">
        <Badge>
          <template #count>
            <span>🔥</span>
          </template>
          <Button>插槽 count</Button>
        </Badge>
      </div>

      <h4>offset 偏移</h4>
      <div class="row">
        <Badge :count="8" :offset="[6, -6]">
          <Button>右上偏移</Button>
        </Badge>
        <Badge :count="8" :offset="[-6, 6]">
          <Button>左下偏移</Button>
        </Badge>
      </div>

      <h4>BadgeRibbon 缎带</h4>
      <div class="row">
        <BadgeRibbon text="HOT" color="red">
          <div class="ribbon-card">缎带卡片内容</div>
        </BadgeRibbon>
      </div>
      <div class="row">
        <BadgeRibbon text="新品" color="blue" placement="start">
          <div class="ribbon-card">placement="start"</div>
        </BadgeRibbon>
      </div>
    </section>

    <section id="demo-collapse" class="demo-section">
      <h3>Collapse</h3>

      <h4>基础用法（CollapsePanel 子项 + defaultActiveKey）</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['p1']">
          <CollapsePanel key="p1" header="这是面板 1 的标题">
            <p>面板 1 的内容，默认展开。</p>
          </CollapsePanel>
          <CollapsePanel key="p2" header="这是面板 2 的标题">
            <p>面板 2 的内容。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>items 配置式 + accordion 手风琴</h4>
      <div class="collapse-box">
        <Collapse accordion :items="collapseItems" />
      </div>

      <h4>受控模式（activeKey + @change）</h4>
      <div class="collapse-box">
        <Collapse :active-key="collapseActiveKey" @change="onCollapseChange">
          <CollapsePanel key="panel-1" header="面板 A">
            <p>内容 A</p>
          </CollapsePanel>
          <CollapsePanel key="panel-2" header="面板 B">
            <p>内容 B</p>
          </CollapsePanel>
        </Collapse>
        <p>当前展开：{{ collapseActiveKey }}</p>
      </div>

      <h4>expandIconPlacement / ghost / size / 无边框</h4>
      <div class="collapse-box">
        <Collapse expand-icon-placement="end" :default-active-key="['a']">
          <CollapsePanel key="a" header="箭头在右侧">
            <p>expandIconPlacement="end"</p>
          </CollapsePanel>
        </Collapse>
        <Collapse ghost :default-active-key="['b']">
          <CollapsePanel key="b" header="ghost 幽灵风格">
            <p>无边框无背景的 ghost 模式</p>
          </CollapsePanel>
        </Collapse>
        <Collapse size="small" :bordered="false">
          <CollapsePanel key="c" header="small 尺寸 + 无边框">
            <p>size="small"、bordered=false</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>#expandIcon 自定义展开图标</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['e1']">
          <template #expandIcon="{ isActive }">
            <span>{{ isActive ? '▼' : '▶' }}</span>
          </template>
          <CollapsePanel key="e1" header="自定义展开图标">
            <p>通过 #expandIcon 插槽替换默认箭头。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>extra 操作区 / #header 插槽</h4>
      <div class="collapse-box">
        <Collapse :default-active-key="['x']">
          <CollapsePanel key="x" header="带 extra 操作">
            <template #extra>
              <Button size="small" @click.stop>更多操作</Button>
            </template>
            <p>extra 插槽内容显示在标题右侧。</p>
          </CollapsePanel>
          <CollapsePanel key="y">
            <template #header><b>自定义 header 插槽</b>（加粗标题）</template>
            <p>通过 #header 插槽自定义标题内容。</p>
          </CollapsePanel>
        </Collapse>
      </div>

      <h4>collapsible 禁用</h4>
      <div class="collapse-box">
        <Collapse>
          <CollapsePanel key="d" header="不可折叠的面板" collapsible="disabled">
            <p>collapsible="disabled" 时面板无法展开/收起。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </section>
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

.demo-anchor-nav {
  padding: 8px 0 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.demo-section {
  padding: 8px 0;
}

.hint {
  font-size: 12px;
  color: #999;
}

.ribbon-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 120px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.collapse-box {
  width: 100%;
  max-width: 640px;
}
</style>
