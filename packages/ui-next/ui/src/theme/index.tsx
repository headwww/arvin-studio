import getDesignToken from './getDesignToken';
import { defaultConfig, useToken as useInternalToken } from './internal';
import compactAlgorithm from './themes/compact';
import darkAlgorithm from './themes/dark';
import defaultAlgorithm from './themes/default';

function useToken() {
  const [theme, token, hashId] = useInternalToken();

  return { theme, token, hashId };
}

export default {
  defaultSeed: defaultConfig.token,
  useToken,
  defaultAlgorithm,
  darkAlgorithm,
  compactAlgorithm,
  getDesignToken,
  defaultConfig,
};

export { type GlobalToken, type MappingAlgorithm } from './interface';
