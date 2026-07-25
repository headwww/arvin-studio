import helperGetDateTime from './helperGetDateTime'
import helperNewDate from './helperNewDate'

/**
 * 返回当前时间戳
 */
const now: () => number = Date.now || function (): number {
  return helperGetDateTime(helperNewDate())
}

export default now
