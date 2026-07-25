import helperCreateInTypeof from './helperCreateInTypeof';

const isNumber = helperCreateInTypeof('number') as (val: any) => val is number;

export default isNumber;
