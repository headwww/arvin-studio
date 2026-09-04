import { Table } from './table';

(Table as any).install = (app: any) => {
  app.component(Table.name, Table);
};
export default Table;
