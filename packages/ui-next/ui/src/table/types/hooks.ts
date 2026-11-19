import type {
  AsTableConstructor,
  AsTableMethods,
  AsTablePrivateMethods,
} from './table';

declare module '@arvin-studio/core' {
  export namespace AsGlobalHooksHandles {
    export interface HookOptions {
      setupTable?(
        $table: AsTableConstructor &
          AsTableMethods &
          AsTablePrivateMethods<any>,
      ): Record<string, any> | void;
      // setupGrid?($grid: AsGridConstructor & AsGridPrivateMethods): void | Record<string, any>
      // setupGantt?($grid: AsGanttConstructor & AsGanttPrivateMethods): void | Record<string, any>
    }
  }
}
