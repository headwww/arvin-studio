import helperCreateInInObjectString from './helperCreateInInObjectString';

const isError = helperCreateInInObjectString('Error') as (
  val: any,
) => val is Error;

export default isError;
