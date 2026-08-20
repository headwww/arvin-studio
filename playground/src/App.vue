<script setup lang="ts">
import {
  Checkbox,
  CheckboxGroup,
  ConfigProvider,
  InputNumber,
  Switch,
} from '@arvin-studio/ui';
</script>

<template>
  <ConfigProvider>
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
    <InputNumber />
    <CheckboxGroup>
      <Checkbox>sss</Checkbox>
      <Checkbox>sss</Checkbox>
    </CheckboxGroup>
    <Switch />
    <!-- <TextArea /> -->
  </ConfigProvider>
</template>
