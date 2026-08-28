<script setup lang="ts">
import { Image, ImagePreviewGroup } from '@arvin-studio/ui';

/** 演示图片地址（Lorem Picsum） */
const img1 = 'https://picsum.photos/id/1015/400/300';
const img2 = 'https://picsum.photos/id/1016/400/300';
const img3 = 'https://picsum.photos/id/1018/400/300';
const img4 = 'https://picsum.photos/id/1019/400/300';
/** 必然失败的地址，演示 fallback 占位 */
const badSrc = 'https://example.com/not-exist.png';
/** fallback 占位图 */
const fallbackImg = 'https://picsum.photos/id/237/180/120';
</script>

<template>
  <section id="demo-image" class="demo-section">
    <h3>Image</h3>

    <h4>基础（点击预览大图）</h4>
    <div class="row">
      <Image :src="img1" width="180" alt="风景" />
      <Image
        :src="img2"
        width="180"
        height="120"
        style="border-radius: 8px"
        alt="风景"
      />
    </div>

    <h4>preview 配置（遮罩文案 / 禁止预览）</h4>
    <div class="row">
      <Image :src="img3" width="180" :preview="{ mask: '点击预览' }" />
      <Image :src="img4" width="180" :preview="false" alt="不可预览" />
    </div>

    <h4>fallback 加载失败占位</h4>
    <div class="row">
      <Image :src="badSrc" width="180" :fallback="fallbackImg" alt="加载失败" />
    </div>

    <h4>#placeholder 加载占位</h4>
    <div class="row">
      <Image :src="img1" width="180">
        <template #placeholder><div class="img-placeholder">加载中...</div></template>
      </Image>
    </div>

    <h4>ImagePreviewGroup 预览组（可左右切换）</h4>
    <div class="row">
      <ImagePreviewGroup>
        <Image :src="img1" width="120" />
        <Image :src="img2" width="120" />
        <Image :src="img3" width="120" />
      </ImagePreviewGroup>
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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.img-placeholder {
  width: 180px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}
</style>
