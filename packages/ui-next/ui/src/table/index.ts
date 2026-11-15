import Column from './column';
import Colgroup from './group';
import { Table } from './table';

(Table as any).install = (app: any) => {
  app.component(Table.name, Table);
  app.component(Column.name, Column);
  app.component(Colgroup.name, Colgroup);
};
export { Colgroup, Column };
export default Table;
