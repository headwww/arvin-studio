import { deleteAsync } from 'del';

export const clean = (directories: string[]) =>
  function CleanDirectories() {
    return deleteAsync(directories);
  };
