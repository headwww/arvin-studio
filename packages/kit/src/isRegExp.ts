import helperCreateInInObjectString from './helperCreateInInObjectString';

const isRegExp = helperCreateInInObjectString('RegExp') as (
  val: any,
) => val is RegExp;

export default isRegExp;
