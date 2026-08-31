<script setup lang="ts">
import { Button, Result } from '@arvin-studio/ui';
</script>

<template>
  <section id="demo-result" class="demo-section">
    <h3>Result</h3>

    <h4>状态（success / info / warning / error）</h4>
    <div class="res-box">
      <Result status="success" title="操作成功" sub-title="已提交，请等待审核。" />
    </div>
    <div class="row">
      <Result status="info" title="信息提示" />
      <Result status="warning" title="警告提示" />
      <Result status="error" title="操作失败" sub-title="请稍后重试。" />
    </div>

    <h4>extra 操作区</h4>
    <div class="res-box">
      <Result status="success" title="支付成功" sub-title="订单号：AS20240001">
        <template #extra>
          <Button type="primary">返回首页</Button>
          <Button>查看订单</Button>
        </template>
      </Result>
    </div>

    <h4>异常页（403 / 404 / 500）</h4>
    <div class="row">
      <Result status="404" title="404" sub-title="页面不存在" />
      <Result status="403" title="403" sub-title="无权限访问" />
      <Result status="500" title="500" sub-title="服务器错误" />
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

.res-box {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}
</style>
