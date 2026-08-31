<script setup lang="ts">
import { Splitter, SplitterPanel } from '@arvin-studio/ui';
</script>

<template>
  <section id="demo-splitter" class="demo-section">
    <h3>Splitter</h3>

    <h4>基础（水平分割，default-size 控制比例）</h4>
    <div class="splitter-box">
      <Splitter>
        <SplitterPanel default-size="40%">
          <div class="panel panel-a">面板 A（40%）</div>
        </SplitterPanel>
        <SplitterPanel>
          <div class="panel panel-b">面板 B</div>
        </SplitterPanel>
      </Splitter>
    </div>

    <h4>min / max 限制 + collapsible 可折叠</h4>
    <div class="splitter-box">
      <Splitter>
        <SplitterPanel :min="80" :max="200" collapsible>
          <div class="panel panel-a">可折叠（min 80 / max 200）</div>
        </SplitterPanel>
        <SplitterPanel>
          <div class="panel panel-b">面板 B</div>
        </SplitterPanel>
      </Splitter>
    </div>

    <h4>vertical 垂直分割</h4>
    <div class="splitter-box">
      <Splitter orientation="vertical">
        <SplitterPanel default-size="40%">
          <div class="panel panel-a">上</div>
        </SplitterPanel>
        <SplitterPanel>
          <div class="panel panel-b">下</div>
        </SplitterPanel>
      </Splitter>
    </div>

    <h4>嵌套分割</h4>
    <div class="splitter-box">
      <Splitter>
        <SplitterPanel default-size="50%">
          <Splitter orientation="vertical" style="height: 100%">
            <SplitterPanel>
              <div class="panel panel-a">嵌套 上</div>
            </SplitterPanel>
            <SplitterPanel>
              <div class="panel panel-b">嵌套 下</div>
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
        <SplitterPanel>
          <div class="panel panel-b">右侧</div>
        </SplitterPanel>
      </Splitter>
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

.splitter-box {
  width: 100%;
  max-width: 720px;
  height: 200px;
  padding: 8px 0;
}

.panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #fff;
}

.panel-a {
  background: #1677ff;
}

.panel-b {
  background: #52c41a;
}
</style>
