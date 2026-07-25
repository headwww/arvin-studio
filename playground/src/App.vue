<script setup lang="ts">
/**
 * @file 对比 @arvin-studio/kit 与 xe-utils toStringDate 函数的输入输出
 */
import { toStringDate } from '@arvin-studio/kit';
import xe from 'xe-utils';

console.log('========== toStringDate — 任意格式转 Date 对象 ==========');

// Date 对象
console.log('[kit] Date对象:', toStringDate(new Date('2024-06-15')));
console.log('[xe]  Date对象:', xe.toStringDate(new Date('2024-06-15')));

// 时间戳 (11-15 位数字)
console.log('[kit] 时间戳:', toStringDate(1718409600000));
console.log('[xe]  时间戳:', xe.toStringDate(1718409600000));
// => Date 2024-06-15...

// 字符串自动解析
console.log('[kit] 日期字符串:', toStringDate('2024-06-15'));
console.log('[xe]  日期字符串:', xe.toStringDate('2024-06-15'));
// => Date 2024-06-15

console.log('[kit] 日期时间:', toStringDate('2024-06-15 10:30:00'));
console.log('[xe]  日期时间:', xe.toStringDate('2024-06-15 10:30:00'));
// => Date 2024-06-15 10:30:00

// 带毫秒
console.log('[kit] 带毫秒:', toStringDate('2024-06-15 10:30:00.123'));
console.log('[xe]  带毫秒:', xe.toStringDate('2024-06-15 10:30:00.123'));

// 自定义格式解析
console.log('[kit] 自定义格式:', toStringDate('15/06/2024', 'dd/MM/yyyy'));
console.log('[xe]  自定义格式:', xe.toStringDate('15/06/2024', 'dd/MM/yyyy'));
// => Date 2024-06-15

// 带时区
console.log('[kit] 带时区Z:', toStringDate('2024-06-15T10:30:00Z'));
console.log('[xe]  带时区Z:', xe.toStringDate('2024-06-15T10:30:00Z'));

// 无效输入 → Invalid Date
console.log('[kit] 无效:', toStringDate('abc'));
console.log('[xe]  无效:', xe.toStringDate('abc'));
// => Invalid Date
</script>

<template>
  <div>打开控制台查看输出</div>
</template>
