interface ResMaps {
  y: number;
  M?: number;
  d?: number;
  H?: number;
  m?: number;
  s?: number;
  S?: number;
}

/**
 * 获取 UTC 时间
 */
function helperGetUTCDateTime(resMaps: ResMaps): number {
  return Date.UTC(
    resMaps.y,
    resMaps.M || 0,
    resMaps.d || 1,
    resMaps.H || 0,
    resMaps.m || 0,
    resMaps.s || 0,
    resMaps.S || 0,
  );
}

export default helperGetUTCDateTime;
