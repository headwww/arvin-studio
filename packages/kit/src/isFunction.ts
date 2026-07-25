import helperCreateInTypeof from './helperCreateInTypeof';

const isFunction = helperCreateInTypeof('function') as (
  val: any,
) => val is Function;

export default isFunction;
