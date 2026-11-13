import type { App as VueApp } from 'vue';

import { createApp } from 'vue';

import {
  VxeAlert,
  VxeAnchor,
  VxeAnchorLink,
  VxeAvatar,
  VxeBadge,
  VxeBreadcrumb,
  VxeBreadcrumbItem,
  VxeButton,
  VxeButtonGroup,
  VxeCalendar,
  VxeCard,
  VxeCarousel,
  VxeCarouselItem,
  VxeCheckbox,
  VxeCheckboxButton,
  VxeCheckboxGroup,
  VxeCol,
  VxeCollapse,
  VxeCollapsePane,
  VxeColorPicker,
  VxeCountdown,
  VxeDatePanel,
  VxeDatePicker,
  VxeDateRangePicker,
  VxeDrawer,
  VxeEmpty,
  VxeForm,
  VxeFormGather,
  VxeFormGroup,
  VxeFormItem,
  VxeIcon,
  VxeIconPicker,
  VxeImage,
  VxeImageGroup,
  VxeImagePreview,
  VxeInput,
  VxeLayoutAside,
  VxeLayoutBody,
  VxeLayoutContainer,
  VxeLayoutFooter,
  VxeLayoutHeader,
  VxeLink,
  VxeList,
  VxeLoading,
  VxeMenu,
  VxeModal,
  VxeNoticeBar,
  VxeNumberInput,
  VxeOptgroup,
  VxeOption,
  VxePager,
  VxePasswordInput,
  VxePrint,
  VxePrintPageBreak,
  VxePulldown,
  VxeRadio,
  VxeRadioButton,
  VxeRadioGroup,
  VxeRate,
  VxeResult,
  VxeRow,
  VxeScrollbar,
  VxeSelect,
  VxeSlider,
  VxeSplitter,
  VxeSplitterPanel,
  VxeSteps,
  VxeSwitch,
  VxeTableSelect,
  VxeTabPane,
  VxeTabs,
  VxeTag,
  VxeText,
  VxeTextarea,
  VxeTextEllipsis,
  VxeTip,
  VxeTooltip,
  VxeTree,
  VxeTreeSelect,
  VxeUI,
  VxeUpload,
  VxeWatermark,
} from 'vxe-pc-ui';
// 导入默认的语言
import zhCN from 'vxe-pc-ui/lib/language/zh-CN';
import {
  VxeColgroup,
  VxeColumn,
  VxeGrid,
  VxeTable,
  VxeToolbar,
} from 'vxe-table';

import App from './App.vue';
import router from './router';

// 导入主题变量，也可以重写主题变量
import 'vxe-pc-ui/styles/cssvar.scss';
import 'vxe-table/styles/cssvar.scss';

VxeUI.setI18n('zh-CN', zhCN);
VxeUI.setLanguage('zh-CN');

function lazyVxeUI(app: VueApp) {
  app.use(VxeAlert);
  app.use(VxeAnchor);
  app.use(VxeAnchorLink);
  app.use(VxeAvatar);
  app.use(VxeBadge);
  app.use(VxeBreadcrumb);
  app.use(VxeBreadcrumbItem);
  app.use(VxeButton);
  app.use(VxeButtonGroup);
  app.use(VxeCalendar);
  app.use(VxeCard);
  app.use(VxeCarousel);
  app.use(VxeCarouselItem);
  app.use(VxeCheckbox);
  app.use(VxeCheckboxButton);
  app.use(VxeCheckboxGroup);
  app.use(VxeCol);
  app.use(VxeCollapse);
  app.use(VxeCollapsePane);
  app.use(VxeColorPicker);
  app.use(VxeCountdown);
  app.use(VxeDatePanel);
  app.use(VxeDatePicker);
  app.use(VxeDateRangePicker);
  app.use(VxeDrawer);
  app.use(VxeEmpty);
  app.use(VxeForm);
  app.use(VxeFormGather);
  app.use(VxeFormGroup);
  app.use(VxeFormItem);
  app.use(VxeIcon);
  app.use(VxeIconPicker);
  app.use(VxeImage);
  app.use(VxeImageGroup);
  app.use(VxeImagePreview);
  app.use(VxeInput);
  app.use(VxeLayoutAside);
  app.use(VxeLayoutBody);
  app.use(VxeLayoutContainer);
  app.use(VxeLayoutFooter);
  app.use(VxeLayoutHeader);
  app.use(VxeLink);
  app.use(VxeList);
  app.use(VxeLoading);
  app.use(VxeMenu);
  app.use(VxeModal);
  app.use(VxeNoticeBar);
  app.use(VxeNumberInput);
  app.use(VxeOptgroup);
  app.use(VxeOption);
  app.use(VxePager);
  app.use(VxePasswordInput);
  app.use(VxePrintPageBreak);
  app.use(VxePrint);
  app.use(VxePulldown);
  app.use(VxeRadio);
  app.use(VxeRadioButton);
  app.use(VxeRadioGroup);
  app.use(VxeRate);
  app.use(VxeResult);
  app.use(VxeRow);
  app.use(VxeScrollbar);
  app.use(VxeSelect);
  app.use(VxeSplitter);
  app.use(VxeSplitterPanel);
  app.use(VxeSlider);
  app.use(VxeSteps);
  app.use(VxeSwitch);
  app.use(VxeTabPane);
  app.use(VxeTableSelect);
  app.use(VxeTabs);
  app.use(VxeTag);
  app.use(VxeTextEllipsis);
  app.use(VxeText);
  app.use(VxeTextarea);
  app.use(VxeTip);
  app.use(VxeTooltip);
  app.use(VxeTree);
  app.use(VxeTreeSelect);
  app.use(VxeUpload);
  app.use(VxeWatermark);
}

function lazyVxeTable(app: VueApp) {
  app.use(VxeTable);
  app.use(VxeColumn);
  app.use(VxeColgroup);
  app.use(VxeGrid);
  app.use(VxeToolbar);
}

createApp(App).use(router).use(lazyVxeUI).use(lazyVxeTable).mount('#app');
