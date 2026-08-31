<script setup lang="ts">
import { Statistic, StatisticTimer } from '@arvin-studio/ui';

/** 倒计时目标：当前时间 + 10 分钟 */
const countdownTarget = Date.now() + 10 * 60 * 1000;
</script>

<template>
  <section id="demo-statistic" class="demo-section">
    <h3>Statistic</h3>

    <h4>基础（title + value + prefix / suffix）</h4>
    <div class="row">
      <Statistic title="总销售额" :value="112893.12" prefix="¥" />
      <Statistic title="活跃用户" :value="9312" suffix="/月" />
      <Statistic title="完成率" :value="93.5" suffix="%" />
    </div>

    <h4>precision 精度 / groupSeparator 千分位</h4>
    <div class="row">
      <Statistic title="圆周率" :value="3.1415926" :precision="2" />
      <Statistic title="访问量" :value="12345678" group-separator="," />
    </div>

    <h4>loading 加载态</h4>
    <div class="row">
      <Statistic title="加载中" :value="12345" loading />
    </div>

    <h4>StatisticTimer 倒计时 / 正计时</h4>
    <div class="row">
      <StatisticTimer
        title="倒计时（10 分钟后）"
        :value="countdownTarget"
        type="countdown"
        format="HH:mm:ss"
      />
    </div>
    <div class="row">
      <StatisticTimer title="正计时" :value="0" type="countup" format="mm:ss" />
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
  gap: 24px;
  align-items: center;
  padding: 8px 0;
}
</style>
