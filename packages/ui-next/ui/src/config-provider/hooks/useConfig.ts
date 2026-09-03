import { useDisabledContext } from '../disabled-context';
import { useSizeContext } from '../size-context';

export function useExportConfig() {
  const componentDisabled = useDisabledContext();
  const componentSize = useSizeContext();
  return {
    componentDisabled,
    componentSize,
  };
}
