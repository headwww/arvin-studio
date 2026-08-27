<script setup lang="ts">
import {
  Checkbox,
  CheckboxGroup,
  InputNumber,
  Switch,
} from '@arvin-studio/ui';
</script>

<template>
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
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}
</style>
