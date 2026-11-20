import type { TableEditMethods, TableEditPrivateMethods } from './edit';

import { browse } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';

const { hooks } = ArvinStudio;

hooks.add('tableEditModule', {
  setupTable($asTable) {
    const { props, reactData, internalData } = $asTable;
    const { refElem } = $asTable.getRefMaps();
    const {
      computeMouseOpts,
      computeEditOpts,
      computeCheckboxOpts,
      computeTreeOpts,
      computeValidOpts,
      computeRendererOpts,
    } = $asTable.getComputeMaps();

    const browseObj = browse();

    let editMethods = {} as TableEditMethods;
    let editPrivateMethods = {} as TableEditPrivateMethods;

    return { ...editMethods, ...editPrivateMethods };
  },
});
