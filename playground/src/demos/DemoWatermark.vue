<script setup lang="ts">
import { Watermark } from '@arvin-studio/ui';

/** 图片水印地址 */
const watermarkImage = 'https://i.pravatar.cc/60?img=5';
</script>

<template>
  <section id="demo-watermark" class="demo-section">
    <h3>Watermark</h3>

    <h4>基础（content 文字水印）</h4>
    <div class="watermark-box">
      <Watermark content="Arvin Studio">
        <div class="wm-content">
          <h4>受水印保护的卡片</h4>
          <p>这段内容上覆盖了文字水印。</p>
        </div>
      </Watermark>
    </div>

    <h4>多行 content / font 样式</h4>
    <div class="watermark-box">
      <Watermark
        :content="['Arvin Studio', 'Do Not Copy']"
        :font="{ color: 'rgba(245, 34, 45, 0.2)', fontSize: 18, fontWeight: 600 }"
      >
        <div class="wm-content">
          <h4>多行 + 红色字体水印</h4>
          <p>通过 font 自定义颜色、字号与字重。</p>
        </div>
      </Watermark>
    </div>

    <h4>gap 间距 / rotate 旋转</h4>
    <div class="watermark-box">
      <Watermark content="Watermark" :gap="[160, 160]" :rotate="0">
        <div class="wm-content">
          <h4>大间距 + 不旋转</h4>
          <p>gap 控制水印单元间距，rotate 控制旋转角度。</p>
        </div>
      </Watermark>
    </div>

    <h4>image 图片水印</h4>
    <div class="watermark-box">
      <Watermark :image="watermarkImage" :width="60" :height="60">
        <div class="wm-content">
          <h4>图片水印</h4>
          <p>使用图片作为水印内容。</p>
        </div>
      </Watermark>
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

.watermark-box {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}

.wm-content {
  height: 160px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}

.wm-content h4 {
  margin: 0 0 8px;
}

.wm-content p {
  margin: 0;
  color: #666;
}
</style>
