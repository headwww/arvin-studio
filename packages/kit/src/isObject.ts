import helperCreateInTypeof from './helperCreateInTypeof';

const isObject = helperCreateInTypeof('object') as (val: any) => val is object;

export default isObject;
