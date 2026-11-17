export const config = {
  table: {
    fit: true,
    showHeader: true,
    animat: true,
    delayHover: 250,
    autoResize: true,
    loadingConfig: {},
    resizeConfig: {
      // refreshDelay: 20
    },
    resizableConfig: {
      dragMode: 'auto',
      showDragTip: true,
      isSyncAutoHeight: true,
      isSyncAutoWidth: true,
      minHeight: 18,
    },
    currentRowConfig: {
      strict: true,
    },
    currentColumnConfig: {
      strict: true,
    },
    radioConfig: {
      // trigger: 'default'
      strict: true,
    },
    rowDragConfig: {
      showIcon: true,
      animation: true,
      showGuidesStatus: true,
      showDragTip: true,
    },
    columnDragConfig: {
      showIcon: true,
      animation: true,
      showGuidesStatus: true,
      showDragTip: true,
    },
    checkboxConfig: {
      // trigger: 'default',
      strict: true,
    },
    tooltipConfig: {
      mode: 'tooltip',
      enterable: true,
      defaultPlacement: 'top',
    },
    headerTooltipConfig: {
      mode: 'tooltip',
      enterable: true,
    },
    footerTooltipConfig: {
      mode: 'tooltip',
      enterable: true,
    },
    validConfig: {
      showErrorMessage: true,
      autoClear: true,
      autoPos: true,
      message: 'inline',
      msgMode: 'single',
      theme: 'beautify',
    },
    columnConfig: {
      autoOptions: {
        isCalcHeader: true,
        isCalcBody: true,
        isCalcFooter: true,
      },
      maxFixedSize: 4,
    },
    cellConfig: {
      padding: true,
    },
    headerCellConfig: {
      height: 'unset',
    },
    footerCellConfig: {
      height: 'unset',
    },
    menuConfig: {
      // visibleMethod () {},
      // transfer: false,
      destroyOnClose: true,
    },
    customConfig: {
      // enabled: false,
      allowVisible: true,
      allowResizable: true,
      allowFixed: true,
      allowSort: true,
      allowAlign: true,
      showSortDragButton: true,
      showFooter: true,
      placement: 'top-right',
      //  storage: false,
      storeOptions: {
        visible: true,
        resizable: true,
        sort: true,
        fixed: true,
        align: true,
        headerAlign: true,
        footerAlign: true,
        aggFunc: true,
      },
      // autoAggGroupValues: false,
      //  checkMethod () {},
      modalOptions: {
        showMaximize: true,
        mask: true,
        lockView: true,
        resize: true,
        escClosable: true,
      },
      drawerOptions: {
        mask: true,
        lockView: true,
        escClosable: true,
        resize: true,
      },
    },
    sortConfig: {
      // remote: false,
      // trigger: 'default',
      // orders: ['asc', 'desc', null],
      // sortMethod: null,
      showIcon: true,
      allowClear: true,
      allowBtn: true,
      iconLayout: 'vertical',
    },
    filterConfig: {
      // remote: false,
      // filterMethod: null,
      // isEvery: false,
      // transfer: false,
      destroyOnClose: true,
      multiple: true,
      showIcon: true,
      maxHeight: 280,
    },
    floatingFilterConfig: {
      // enabled: false
    },
    aggregateConfig: {
      padding: true,
      placement: 'left',
      rowField: 'id',
      parentField: '_X_ROW_PARENT_KEY',
      childrenField: '_X_ROW_CHILDREN',
      mapChildrenField: '_X_ROW_CHILD_LIST',
      indent: 20,
      showIcon: true,
      maxGroupSize: 4,
      showAggFuncTitle: true,
    },
    treeConfig: {
      padding: true,
      rowField: 'id',
      parentField: 'parentId',
      childrenField: 'children',
      hasChildField: 'hasChild',
      mapChildrenField: '_X_ROW_CHILD',
      indent: 20,
      showIcon: true,
      showRootLine: true,
    },
    expandConfig: {
      // trigger: 'default',
      showIcon: true,
      mode: 'fixed',
    },
    editConfig: {
      // mode: 'cell',
      // cache: true,
      showIcon: true,
      showAsterisk: true,
      autoFocus: true,
      isReuseKeep: true,
    },
    importConfig: {
      _typeMaps: {
        csv: 1,
        html: 1,
        xml: 1,
        txt: 1,
      },
    },
    exportConfig: {
      _typeMaps: {
        csv: 1,
        html: 1,
        xml: 1,
        txt: 1,
      },
    },
    printConfig: {},
    mouseConfig: {
      extension: true,
    },
    keyboardConfig: {
      isAll: true,
      isEsc: true,
    },
    areaConfig: {
      autoClear: true,
      selectCellByHeader: true,
      selectCellByBody: true,
      extendDirection: {
        top: true,
        left: true,
        bottom: true,
        right: true,
      },
    },
    clipConfig: {
      isCopy: true,
      isCut: true,
      isPaste: true,
    },
    fnrConfig: {
      isFind: true,
      isReplace: true,
    },
    virtualXConfig: {
      // enabled: false,
      gt: 24,
      preSize: 1,
      oSize: 0,
    },
    virtualYConfig: {
      // enabled: false,
      // mode: 'wheel',
      gt: 100,
      preSize: 1,
      oSize: 0,
    },
    scrollbarConfig: {
      // width: 14,
      // height: 14,
      x: {
        // position: 'bottom',
        visible: true,
      },
      y: {
        // position: 'right',
        visible: true,
      },
    },
    undoRedoHistoryConfig: {
      stackSize: 50,
    },
  },
  grid: {
    // size: null,
    // zoomConfig: {
    //   escRestore: true
    // },
    formConfig: {
      enabled: true,
    },
    pagerConfig: {
      enabled: true,
      // perfect: false
    },
    toolbarConfig: {
      enabled: true,
      // perfect: false
    },
    proxyConfig: {
      enabled: true,
      autoLoad: true,
      showLoading: true,
      showResponseMsg: true,
      showActionMsg: true,
      response: {
        list: 'list',
        result: 'result',
        total: 'page.total',
        footerData: 'footerData',
        message: 'message',
      },
      // beforeItem: null,
      // beforeColumn: null,
      // beforeQuery: null,
      // afterQuery: null,
      // beforeDelete: null,
      // afterDelete: null,
      // beforeSave: null,
      // afterSave: null
    },
  },
};
