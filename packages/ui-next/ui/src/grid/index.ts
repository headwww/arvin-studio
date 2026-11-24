import { Grid } from './grid';

(Grid as any).install = (app: any) => {
  app.component(Grid.name, Grid);
};
export default Grid;
