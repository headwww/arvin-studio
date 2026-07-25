import helperCreateInTypeof from './helperCreateInTypeof';

const isUndefined = helperCreateInTypeof('undefined') as (
  val: any,
) => val is undefined;

export default isUndefined;
