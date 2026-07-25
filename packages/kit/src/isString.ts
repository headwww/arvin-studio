import helperCreateInTypeof from './helperCreateInTypeof';

const isString = helperCreateInTypeof('string') as (val: any) => val is string;

export default isString;
