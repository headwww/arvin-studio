export default function useCheckable(
  cascaderPrefixCls: string,
  multiple?: boolean,
) {
  if (!multiple) {
    return false;
  }
  return <span class={`${cascaderPrefixCls}-checkbox-inner`} />;
}
