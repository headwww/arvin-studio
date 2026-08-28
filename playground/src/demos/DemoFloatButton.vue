<script setup lang="ts">
import { FloatButton } from '@arvin-studio/ui';
</script>

<template>
  <section id="demo-float-button" class="demo-section">
    <h3>FloatButton</h3>

    <h4>说明</h4>
    <p class="desc">
      FloatButton 悬浮于视口角落（fixed），右侧从上到下依次是：主按钮、带
      tooltip、带 badge、方形文字按钮、链接按钮；左列为 Group
      与回顶按钮。滚动页面即可看到各示例常驻。
    </p>

    <!-- 右侧列 -->
    <FloatButton type="primary" icon="✉️" :style="{ right: 24, bottom: 24 }" />
  </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.desc {
  line-height: 1.6;
  color: #666;
}
</style>
