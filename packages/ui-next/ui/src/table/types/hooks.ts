import type {
  AsGridConstructor,
  AsGridPrivateMethods,
} from '../../grid/types/grid';
import type {
  AsTableConstructor,
  AsTableMethods,
  AsTablePrivateMethods,
} from './table';

declare module '@arvin-studio/core' {
  export namespace AsGlobalHooksHandles {
    export interface HookOptions {
      setupGrid?(
        $grid: AsGridConstructor & AsGridPrivateMethods,
      ): Record<string, any> | void;
      setupTable?(
        $table: AsTableConstructor &
          AsTableMethods &
          AsTablePrivateMethods<any>,
      ): Record<string, any> | void;
      // setupGantt?($grid: AsGanttConstructor & AsGanttPrivateMethods): void | Record<string, any>
    }
  }
}
