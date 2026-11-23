import type { AsTablePropTypes } from '../../types/table';

// 默认导出或打印的 HTML 样式
const defaultHtmlStyle =
  'body{padding:0;color:rgba(0,0,0,0.7);font-family:"Microsoft YaHei",微软雅黑,"MicrosoftJhengHei",华文细黑,STHeiti,MingLiu}body *{-webkit-box-sizing:border-box;box-sizing:border-box}.as-table{border-collapse:collapse;text-align:left;border-spacing:0}.as-table.is--default-width,.as-table.is--auto-width{width:100%}.as-table.is--scale-width{table-layout:fixed}.as-table,.as-table th,.as-table td{white-space:pre-line;word-break:break-all;border-color:#d0d0d0;border-style:solid;border-width:0}.border--default,.border--full,.border--outer{border-top-width:1px}.border--default,.border--full,.border--outer{border-left-width:1px}.border--outer,.border--default th,.border--default td,.border--full th,.border--full td,.border--outer th,.border--inner th,.border--inner td{border-bottom-width:1px}.border--default,.border--outer,.border--full th,.border--full td{border-right-width:1px}.border--default th,.border--full th,.border--outer th{background-color:#f8f8f9}.as-table td>div,.as-table th>div{padding:0.5em 0.4em}.col--center{text-align:center}.col--right{text-align:right}.as-table .col--ellipsis>div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.as-table--tree-node{text-align:left}.as-table--tree-node-wrapper{position:relative}.as-table input[type="checkbox"]{margin:0}.as-table input[type="checkbox"],.as-table input[type="radio"]{vertical-align:middle}';

export function getExportBlobByContent(
  content: string,
  options: { type: string },
) {
  return new Blob([content], { type: `text/${options.type};charset=utf-8;` });
}

export function createHtmlPage(
  opts: AsTablePropTypes.PrintConfig,
  content: string,
): string {
  const { style } = opts;
  return [
    '<!DOCTYPE html><html>',
    '<head>',
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">',
    `<title>${opts.sheetName || ''}</title>`,
    '<style media="print">.as-page-break-before{page-break-before:always;}.as-page-break-after{page-break-after:always;}</style>',
    `<style>${defaultHtmlStyle}</style>`,
    style ? `<style>${style}</style>` : '',
    '</head>',
    `<body>${content}</body>`,
    '</html>',
  ].join('');
}
