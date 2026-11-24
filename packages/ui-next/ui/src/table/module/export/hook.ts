import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePropTypes,
} from '../../types/table';
import type { TableExportMethods } from './export';

import {
  eachTree,
  includes,
  isBoolean,
  isFunction,
  keys,
  mapTree,
  searchTree,
  toDateString,
  toNumber,
} from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import { formatText, getCellValue } from '../../util';
import { createHtmlPage, getExportBlobByContent } from './util';

const { hooks } = ArvinStudio;

const csvBOM = '\u{FEFF}';
const enterSymbol = '\r\n';
const htmlCellElem = { current: null as HTMLDivElement | null };

const defaultFilterExportColumn = (column: AsTableDefines.ColumnInfo) => {
  return !!column.field || !includes(['seq', 'checkbox', 'radio'], column.type);
};

const toBooleanValue = (val: boolean) => (val ? 'TRUE' : 'FALSE');

const toStringValue = (val: any) => (val === null ? '' : `${val}`);

const escapeHtml = (val: string) =>
  val
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const escapeCsv = (val: string) => {
  if (includes([',', '"', '\n', '\r'], '')) {
    return val;
  }
  if (/[",\n\r]/.test(val)) {
    return `"${val.replaceAll('"', '""')}"`;
  }
  return val;
};

const getCsvCellTypeLabel = (val: any) => {
  if (isBoolean(val)) {
    return toBooleanValue(val);
  }
  const str = toStringValue(val);
  // 避免 Excel 将长数字转换为科学计数法
  if (/^\d{12,}$/.test(str)) {
    return `\t${str}`;
  }
  return str;
};

const toTxtCellLabel = (val: any) => toStringValue(val).replaceAll('\t', ' ');

// oxlint-disable-next-line no-unused-vars
const getConvertColumns = (columns: AsTableDefines.ColumnInfo[]) => {
  const rest: AsTableDefines.ColumnInfo[] = [];
  columns.forEach((column) => {
    rest.push(column);
    if (column.children && column.children.length > 0) {
      rest.push(...getConvertColumns(column.children));
    }
  });
  return rest;
};

const convertToRows = (columns: AsTableDefines.ColumnInfo[]) => {
  const maxLevel = 1;
  const rows: AsTableDefines.ColumnInfo[][] = [];
  const getChildLevel = (column: AsTableDefines.ColumnInfo): number => {
    let level = 1;
    if (column.children && column.children.length > 0) {
      column.children.forEach((child) => {
        level = Math.max(level, getChildLevel(child) + 1);
      });
    }
    return level;
  };
  let maxDepth = maxLevel;
  columns.forEach((column) => {
    maxDepth = Math.max(maxDepth, getChildLevel(column));
  });
  const setColSpan = (column: AsTableDefines.ColumnInfo, level: number) => {
    if (!rows[level]) {
      rows[level] = [];
    }
    rows[level].push(column);
    if (column.children && column.children.length > 0) {
      column.children.forEach((child) => {
        setColSpan(child, level + 1);
      });
    } else {
      for (let i = level + 1; i < maxDepth; i++) {
        if (!rows[i]) {
          rows[i] = [];
        }
        rows[i]!.push({ ...column, colSpan: 0 } as any);
      }
    }
  };
  columns.forEach((column) => setColSpan(column, 0));
  return rows;
};

const toTableBorder = (border: string) => {
  return border === 'none' ? '' : `border--${border}`;
};

export default function tableExportModule() {
  hooks.add('tableExportModule', {
    setupTable($asTable: AsTableConstructor) {
      const { props, reactData } = $asTable;
      const { internalData } = $asTable;
      const { computeExportOpts, computeImportOpts, computePrintOpts } =
        $asTable.getComputeMaps();
      const [locale] = useLocale('Table', enUS.Table);
      const t = (key: string, fallback: string) =>
        (locale?.value as any)?.[key] || fallback;

      const getColumns = (): AsTableDefines.ColumnInfo[] => {
        const list: AsTableDefines.ColumnInfo[] = [];
        eachTree(
          internalData.collectColumn,
          (column: AsTableDefines.ColumnInfo) => {
            const isColGroup = column.children && column.children.length > 0;
            if (!isColGroup && column.visible !== false) {
              list.push(column);
            }
          },
          { children: 'children' },
        );
        return list;
      };

      const getHeaderTitle = (column: AsTableDefines.ColumnInfo) => {
        const col: any = column;
        return formatText(col.getTitle ? col.getTitle() : col.title || '', 1);
      };

      const getSeq = (rowIndex: number) => rowIndex + 1;

      const getBodyLabelData = (
        opts: any,
        columns: AsTableDefines.ColumnInfo[],
        datas: any[],
      ) => {
        const { treeConfig, columnConfig } = props;
        const childrenField =
          treeConfig &&
          ((treeConfig as any).children || (treeConfig as any).childrenField);
        const columnOpts: any = columnConfig || {};
        const buildItem = (row: any, rowIndex: number) => {
          const item: any = { _row: row };
          columns.forEach((column) => {
            let cellValue: any = '';
            const exportMethod =
              (column as any).exportMethod ||
              (column as any).exportCellMethod ||
              columnOpts.exportMethod;
            if (exportMethod) {
              cellValue = exportMethod({
                $table: $asTable,
                row,
                column,
                options: opts,
              });
            } else
              switch (column.type) {
                case 'checkbox': {
                  cellValue = toBooleanValue(
                    $asTable.isCheckedByCheckboxRow(row),
                  );

                  break;
                }
                case 'radio': {
                  cellValue = toBooleanValue($asTable.isCheckedByRadioRow(row));

                  break;
                }
                case 'seq': {
                  cellValue = getSeq(rowIndex);

                  break;
                }
                default: {
                  if (opts.original) {
                    cellValue = getCellValue(row, column);
                  } else {
                    cellValue = $asTable.getCellLabel(row, column);
                    if (column.type === 'html') {
                      if (!htmlCellElem.current) {
                        htmlCellElem.current = document.createElement('div');
                      }
                      htmlCellElem.current.innerHTML = `${cellValue}`;
                      cellValue = htmlCellElem.current.innerText.trim();
                    }
                  }
                }
              }
            item[column.id] = toStringValue(cellValue);
          });
          return item;
        };
        if (childrenField) {
          const rest: any[] = [];
          eachTree(
            datas,
            (
              row: any,
              rowIndex: number,
              _items: any[],
              _path: any[],
              parentRow: any,
            ) => {
              if (
                opts.isTreeAllExpanded ||
                !parentRow ||
                $asTable.isTreeExpandByRow(parentRow)
              ) {
                rest.push(buildItem(row, rowIndex));
              }
            },
            { children: childrenField },
          );
          return rest;
        }
        return datas.map((row, rowIndex) => buildItem(row, rowIndex));
      };

      const getFooterData = (columns: AsTableDefines.ColumnInfo[]) => {
        const rows: any[] = [];
        const footerTableData = (reactData as any).footerTableData || [];
        footerTableData.forEach((row: any) => {
          const item: any = { _row: row };
          columns.forEach((column) => {
            item[column.id] = $asTable.getFooterCellLabel(row, column);
          });
          rows.push(item);
        });
        return rows;
      };

      const toCsv = (opts: any) => {
        const { columns, data, footerData } = opts;
        const lines: string[] = [];
        if (opts.isHeader) {
          lines.push(
            columns
              .map((column: AsTableDefines.ColumnInfo) =>
                escapeCsv(getHeaderTitle(column)),
              )
              .join(','),
          );
        }
        data.forEach((row: any) => {
          lines.push(
            columns
              .map((column: AsTableDefines.ColumnInfo) =>
                escapeCsv(getCsvCellTypeLabel(row[column.id])),
              )
              .join(','),
          );
        });
        if (opts.isFooter && footerData.length > 0) {
          footerData.forEach((row: any) => {
            lines.push(
              columns
                .map((column: AsTableDefines.ColumnInfo) =>
                  escapeCsv(getCsvCellTypeLabel(row[column.id])),
                )
                .join(','),
            );
          });
        }
        return csvBOM + lines.join(enterSymbol);
      };

      const toTxt = (opts: any) => {
        const { columns, data, footerData } = opts;
        const lines: string[] = [];
        if (opts.isHeader) {
          lines.push(
            columns
              .map((column: AsTableDefines.ColumnInfo) =>
                toTxtCellLabel(getHeaderTitle(column)),
              )
              .join('\t'),
          );
        }
        data.forEach((row: any) => {
          lines.push(
            columns
              .map((column: AsTableDefines.ColumnInfo) =>
                toTxtCellLabel(row[column.id]),
              )
              .join('\t'),
          );
        });
        if (opts.isFooter && footerData.length > 0) {
          footerData.forEach((row: any) => {
            lines.push(
              columns
                .map((column: AsTableDefines.ColumnInfo) =>
                  toTxtCellLabel(row[column.id]),
                )
                .join('\t'),
            );
          });
        }
        return csvBOM + lines.join(enterSymbol);
      };

      const toHtml = (opts: any) => {
        const { columns, colgroups, data, footerData } = opts;
        const borderClass = toTableBorder(opts.original ? 'default' : 'full');
        const widthClass =
          opts.widthMode === 'auto'
            ? 'is--auto-width'
            : opts.widthMode === 'scale'
              ? 'is--scale-width'
              : 'is--default-width';
        const html: string[] = [];
        html.push(`<table class="as-table ${borderClass} ${widthClass}">`);
        if (colsWidth(columns)) {
          html.push('<colgroup>');
          colsWidth(columns)!.forEach((width: number) => {
            html.push(`<col style="width:${width}px">`);
          });
          html.push('</colgroup>');
        }
        if (opts.isHeader) {
          html.push('<thead>');
          if (opts.isTitle) {
            html.push(
              `<tr><th colspan="${columns.length}">${
                opts.sheetName || ''
              }</th></tr>`,
            );
          }
          (colgroups.length > 0 ? colgroups : [columns]).forEach(
            (cols: any[]) => {
              html.push('<tr>');
              cols.forEach((column: any) => {
                if (column.colSpan === 0) {
                  return;
                }
                const rowspan =
                  column.rowSpan && column.rowSpan > 1
                    ? ` rowspan="${column.rowSpan}"`
                    : '';
                const colspan =
                  column.colSpan && column.colSpan > 1
                    ? ` colspan="${column.colSpan}"`
                    : '';
                html.push(
                  `<th class="col--${column.align || 'left'}"${rowspan}${colspan}><div>${escapeHtml(getHeaderTitle(column))}</div></th>`,
                );
              });
              html.push('</tr>');
            },
          );
          html.push('</thead>');
        }
        html.push('<tbody>');
        data.forEach((row: any) => {
          html.push('<tr>');
          columns.forEach((column: AsTableDefines.ColumnInfo) => {
            const cellValue = opts.original
              ? getCellValue(row._row || row, column)
              : row[column.id];
            html.push(
              `<td class="col--${column.align || 'left'}"><div>${escapeHtml(
                toStringValue(cellValue),
              )}</div></td>`,
            );
          });
          html.push('</tr>');
        });
        html.push('</tbody>');
        if (opts.isFooter && footerData.length > 0) {
          html.push('<tfoot>');
          footerData.forEach((row: any) => {
            html.push('<tr>');
            columns.forEach((column: AsTableDefines.ColumnInfo) => {
              html.push(
                `<td><div>${escapeHtml(toStringValue(row[column.id]))}</div></td>`,
              );
            });
            html.push('</tr>');
          });
          html.push('</tfoot>');
        }
        html.push('</table>');
        return html.join('');
      };

      const colsWidth = (columns: AsTableDefines.ColumnInfo[]) => {
        const widths = columns
          .map((column) => toNumber(column.renderWidth || column.width))
          .filter((width) => width > 0);
        return widths.length === columns.length ? widths : null;
      };

      const toXml = (opts: any) => {
        const { columns, data } = opts;
        const lines = ['<?xml version="1.0" encoding="utf-8"?>', '<table>'];
        data.forEach((row: any) => {
          lines.push('  <row>');
          columns.forEach((column: AsTableDefines.ColumnInfo) => {
            lines.push(
              `    <column name="${escapeHtml(column.field || column.id)}">${escapeHtml(toStringValue(row[column.id]))}</column>`,
            );
          });
          lines.push('  </row>');
        });
        lines.push('</table>');
        return lines.join(enterSymbol);
      };

      const getContent = (opts: any) => {
        switch (`${opts.type}`) {
          case 'csv': {
            return toCsv(opts);
          }
          case 'html': {
            return toHtml(opts);
          }
          case 'txt': {
            return toTxt(opts);
          }
          case 'xml': {
            return toXml(opts);
          }
          default: {
            return '';
          }
        }
      };

      const saveFile = (options: {
        content: Blob | string;
        filename: string;
        type: string;
      }) =>
        new Promise((resolve, reject) => {
          try {
            const blob =
              options.content instanceof Blob
                ? options.content
                : getExportBlobByContent(options.content, {
                    type: options.type,
                  });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = options.filename;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            resolve({ status: true });
          } catch (error) {
            // oxlint-disable-next-line prefer-promise-reject-errors
            reject({ status: false, error });
          }
        });

      const readFile = (options?: {
        message?: boolean;
        multiple?: boolean;
        types?: string[];
      }) =>
        new Promise<{ file: File; files: File[]; status: boolean }>(
          (resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = (options?.types || [])
              .map((type) => `.${type}`)
              .join(',');
            input.multiple = !!options?.multiple;
            input.style.display = 'none';
            input.onchange = () => {
              const files = [...(input.files || [])];
              input.remove();
              if (files.length === 0) {
                // oxlint-disable-next-line prefer-promise-reject-errors
                reject({ status: false });
                return;
              }
              resolve({ file: files[0]!, files, status: true });
            };
            document.body.append(input);
            input.click();
          },
        );

      const downloadFile = (opts: any, content: string) => {
        if (opts.download === false) {
          return Promise.resolve({
            status: true,
            content,
            filename: opts.filename,
            type: opts.type,
          });
        }
        return saveFile({
          content,
          filename: `${opts.filename}.${opts.type}`,
          type: opts.type,
        }).then((rest: any) => ({ ...rest, content, filename: opts.filename }));
      };

      const handleFilterColumns = (
        _opts: any,
        column: AsTableDefines.ColumnInfo,
        columns: any[],
      ) => {
        return columns.some((item) => {
          if (item === column) {
            return true;
          }
          if (isStringLike(item)) {
            return item === column.field || item === column.id;
          }
          return (
            item.id === column.id ||
            item.field === column.field ||
            item.field === column.type
          );
        });
      };

      const handleFilterFields = (
        _opts: any,
        column: AsTableDefines.ColumnInfo,
        includeFields: string[] | undefined,
        includeFdMaps: Record<string, number>,
        excludeFdMaps: Record<string, number>,
        extraFdMaps: Record<string, number>,
      ) => {
        if (excludeFdMaps[column.field]) {
          return false;
        }
        if (extraFdMaps[column.field]) {
          return true;
        }
        if (includeFields && includeFields.length > 0) {
          return !!includeFdMaps[column.field];
        }
        return column.visible !== false;
      };

      const isStringLike = (val: any) =>
        typeof val === 'string' || typeof val === 'number';

      const handleExport = (opts: any) => {
        const exportOpts = computeExportOpts.value;
        if (opts.remote && exportOpts.exportMethod) {
          return Promise.resolve(
            exportOpts.exportMethod({ $table: $asTable, options: opts }),
          ).then(() => ({ status: true }));
        }
        if (exportOpts.exportMethod) {
          return Promise.resolve(
            exportOpts.exportMethod({ $table: $asTable, options: opts }),
          ).then(() => ({ status: true }));
        }
        const afterExportMethod =
          opts.afterExportMethod || exportOpts.afterExportMethod;
        return Promise.resolve()
          .then(() =>
            ($asTable as any).preventEvent(
              null,
              'event.export',
              { options: opts },
              () => {
                const content = getContent(opts);
                return downloadFile(opts, content);
              },
            ),
          )
          .then((rest: any) => {
            if (afterExportMethod) {
              afterExportMethod({
                $table: $asTable,
                options: opts,
                status: true,
              });
            }
            return rest;
          });
      };

      const parseCsvLines = (content: string) => {
        const rows: string[][] = [];
        let row: string[] = [];
        let cell = '';
        let inQuotes = false;
        for (let i = 0; i < content.length; i++) {
          const char = content[i]!;
          if (inQuotes) {
            if (char === '"') {
              if (content[i + 1] === '"') {
                cell += '"';
                i++;
              } else {
                inQuotes = false;
              }
            } else {
              cell += char;
            }
            continue;
          }
          // eslint-disable-next-line unicorn/prefer-switch
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            row.push(cell);
            cell = '';
          } else if (char === '\n') {
            row.push(cell.replace(/\r$/, ''));
            rows.push(row);
            row = [];
            cell = '';
          } else {
            cell += char;
          }
        }
        if (cell || row.length > 0) {
          row.push(cell.replace(/\r$/, ''));
          rows.push(row);
        }
        return rows.filter((item) => item.some((val) => val !== ''));
      };

      const parseTxtLines = (content: string) => {
        return content
          .split(/\r?\n/)
          .filter((line) => line !== '')
          .map((line) => line.split('\t'));
      };

      const parseHTMLRows = (content: string) => {
        const doc = new DOMParser().parseFromString(content, 'text/html');
        const rows: string[][] = [];
        doc.querySelectorAll('tr').forEach((tr) => {
          const cells: string[] = [];
          tr.querySelectorAll('th,td').forEach((cell) => {
            cells.push((cell.textContent || '').trim());
          });
          if (cells.length > 0) {
            rows.push(cells);
          }
        });
        return rows;
      };

      const parseXmlRows = (content: string) => {
        const doc = new DOMParser().parseFromString(content, 'text/xml');
        const rows: string[][] = [];
        doc.querySelectorAll('row').forEach((row) => {
          const cells: string[] = [];
          row.querySelectorAll('column').forEach((cell) => {
            cells.push((cell.textContent || '').trim());
          });
          rows.push(cells);
        });
        return rows;
      };

      const parseRows = (content: string, type: string) => {
        switch (type) {
          case 'csv': {
            return parseCsvLines(content);
          }
          case 'html': {
            return parseHTMLRows(content);
          }
          case 'txt': {
            return parseTxtLines(content);
          }
          case 'xml': {
            return parseXmlRows(content);
          }
          default: {
            return [];
          }
        }
      };

      const handleImport = async (file: File, options: any) => {
        const importOpts = computeImportOpts.value;
        const opts = { ...importOpts, ...options };
        const type =
          opts.type || (file.name.split('.').pop() || '').toLowerCase();
        const content = await file.text();
        const rows = parseRows(content, type);
        if (rows.length === 0) {
          // oxlint-disable-next-line no-throw-literal
          throw { status: false, msg: 'empty' };
        }
        const columns = getColumns();
        const fields = rows[0]!.map((label) => {
          const column = columns.find(
            (item) =>
              `${item.field}` === label || getHeaderTitle(item) === label,
          );
          return column ? column.field : label;
        });
        const records = rows.slice(1).map((row) => {
          const record: Record<string, any> = {};
          fields.forEach((field, index) => {
            if (field) {
              record[field] = row[index] ?? '';
            }
          });
          return record;
        });
        if (opts.beforeImportMethod) {
          const rest = opts.beforeImportMethod({
            options: opts,
            $table: $asTable,
          });
          if (rest === false) {
            // oxlint-disable-next-line no-throw-literal
            throw { status: false, msg: 'before prevent' };
          }
        }
        const created = await $asTable.createData(records);
        const mode = opts.mode || 'insertTop';
        ($asTable as any).preventEvent(
          null,
          'event.import',
          { options: opts },
          () => {
            if (mode === 'covering') {
              return $asTable.reloadData(created);
            }
            return $asTable.reloadData([
              ...created,
              ...(internalData.afterFullData || []),
            ]);
          },
        );
        if (opts.afterImportMethod) {
          opts.afterImportMethod({
            status: true,
            options: opts,
            $table: $asTable,
          });
        }
        return { status: true };
      };

      const handleExportAndPrint = (options: any, isPrint = false) => {
        const exportOpts = computeExportOpts.value;
        const opts = { ...exportOpts, ...options };
        const { collectColumn } = internalData;
        const treeColumns = (mapTree as any)(
          collectColumn,
          (column: AsTableDefines.ColumnInfo) => ({
            ...column,
            title: getHeaderTitle(column),
            type: column.type,
            checked: column.visible !== false,
            halfChecked: false,
            disabled: !!(
              opts.checkMethod &&
              !opts.checkMethod({ $table: $asTable, column })
            ),
          }),
          { children: 'children' },
        ) as any[];
        const typeList = (
          opts.types ||
          keys(exportOpts._typeMaps || {}) || ['csv', 'txt', 'html', 'xml']
        ).map((value: string) => ({
          value,
          label: t(
            `exportType${value.charAt(0).toUpperCase()}${value.slice(1)}`,
            value.toUpperCase(),
          ),
        }));
        const modeList = (opts.modes || ['current', 'selected', 'empty']).map(
          (value: any) => ({
            value: typeof value === 'string' ? value : value.value,
            label:
              typeof value === 'string'
                ? t(
                    `exportMode${value.charAt(0).toUpperCase()}${value.slice(1)}`,
                    value,
                  )
                : value.label,
          }),
        );
        const hasMerge = !!(
          internalData.mergeBodyList?.length ||
          internalData.mergeFooterList?.length
        );
        Object.assign(reactData.exportStore, {
          visible: true,
          isPrint,
          hasMerge,
          hasTree: !!props.treeConfig,
          hasRowGroup: !!(props as any).rowGroupConfig,
          hasColgroup: collectColumn.some(
            (column) => column.children && column.children.length > 0,
          ),
          hasFooter: ((reactData as any).footerTableData || []).length > 0,
          columns: treeColumns,
          typeList,
          modeList,
        });
        Object.assign(reactData.exportParams, opts, {
          type: opts.type || typeList[0]?.value || 'csv',
          mode: opts.mode || modeList[0]?.value || 'current',
          filename: opts.filename || `export_${toDateString(Date.now())}`,
          sheetName: opts.sheetName || document.title || 'Sheet1',
        });
        reactData.initStore.export = true;
        return nextTickImpl();
      };

      const nextTickImpl = () => Promise.resolve();

      const exportData = (options?: AsTablePropTypes.ExportConfig) => {
        const exportOpts = computeExportOpts.value;
        const { afterFullData, afterTreeFullData, collectColumn } =
          internalData;
        const { showHeader, showFooter, treeConfig } = props;
        const hasMerge = !!(
          internalData.mergeBodyList?.length ||
          internalData.mergeFooterList?.length
        );
        const opts: any = {
          message: true,
          isHeader: showHeader !== false,
          isTitle: showHeader !== false,
          isFooter: showFooter !== false,
          isColgroup: true,
          isMerge: hasMerge,
          useStyle: true,
          current: 'current',
          modes: ['current', 'selected', 'empty'],
          download: true,
          type: 'csv',
          ...exportOpts,
          ...options,
        };
        opts.isHeader ??= true;
        opts.isTitle ??= opts.isHeader;
        opts.isFooter ??= showFooter !== false;
        let { mode, type } = opts;
        const selectRecords = $asTable.getCheckboxRecords();
        if (!mode) {
          mode = selectRecords.length > 0 ? 'selected' : 'current';
        }
        const excludeFdMaps: Record<string, number> = {};
        (opts.excludeFields || []).forEach((field: string) => {
          excludeFdMaps[field] = 1;
        });
        const includeFdMaps: Record<string, number> = {};
        (opts.includeFields || []).forEach((field: string) => {
          includeFdMaps[field] = 1;
        });
        const extraFdMaps: Record<string, number> = {};
        (opts.extraFields || []).forEach((field: string) => {
          extraFdMaps[field] = 1;
        });
        let customCols: any[] = [];
        if (opts._columns) {
          customCols = searchTree(opts._columns, () => true, {
            children: 'childNodes',
            original: true,
          }) as any[];
        } else if (opts.columns) {
          customCols = searchTree(opts.columns, () => true, {
            children: 'childNodes',
            original: true,
          }) as any[];
        } else {
          customCols = searchTree(
            collectColumn,
            (column: AsTableDefines.ColumnInfo) => {
              const isColGroup = !!(
                column.children && column.children.length > 0
              );
              if (opts.columns) {
                return handleFilterColumns(opts, column, opts.columns);
              }
              if (opts.excludeFields || opts.includeFields) {
                return handleFilterFields(
                  opts,
                  column,
                  opts.includeFields,
                  includeFdMaps,
                  excludeFdMaps,
                  extraFdMaps,
                );
              }
              return (
                column.visible !== false &&
                (isColGroup || defaultFilterExportColumn(column))
              );
            },
            { children: 'children', original: true },
          ) as any[];
        }
        const cols: AsTableDefines.ColumnInfo[] = [];
        eachTree(
          customCols,
          (column: any) => {
            if (!(column.children && column.children.length > 0)) {
              cols.push(column);
            }
          },
          { children: 'childNodes' },
        );
        const colgroups = convertToRows(customCols);
        let filename = opts.filename;
        if (isFunction(filename)) {
          filename = filename({ options: opts, $table: $asTable });
        }
        if (!filename) {
          filename = t('exportFilename', '导出文件');
        }
        let sheetName = opts.sheetName;
        if (isFunction(sheetName)) {
          sheetName = sheetName({ options: opts, $table: $asTable });
        }
        if (!sheetName) {
          sheetName = document.title || 'Sheet1';
        }
        if (!includes(keys(exportOpts._typeMaps || { csv: 1 }), type)) {
          const params = { status: false, msg: 'type error' };
          // oxlint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(params);
        }
        if (opts.beforeExportMethod && !opts.print) {
          const rest = opts.beforeExportMethod({
            options: opts,
            $table: $asTable,
          });
          if (rest === false) {
            // oxlint-disable-next-line prefer-promise-reject-errors
            return Promise.reject({ status: false, msg: 'before prevent' });
          }
        }
        let data: any[] = opts.data;
        if (!data) {
          if (mode === 'selected') {
            data = selectRecords;
          } else if (mode === 'current') {
            data = treeConfig ? afterTreeFullData : afterFullData;
          } else {
            data = [];
          }
        }
        if (opts.dataFilterMethod) {
          data = data.filter((row: any, rowIndex: number) =>
            opts.dataFilterMethod({
              $table: $asTable,
              row,
              $rowIndex: rowIndex,
            }),
          );
        }
        const bodyData = getBodyLabelData(opts, cols, data);
        const footerData = opts.isFooter ? getFooterData(cols) : [];
        const handleOptions = {
          ...opts,
          columns: cols,
          colgroups,
          data: bodyData,
          footerData,
          filename,
          sheetName,
        };
        return handleExport(handleOptions);
      };

      const print = (options?: AsTablePropTypes.PrintConfig) => {
        const printOpts = computePrintOpts.value;
        const opts: any = {
          ...printOpts,
          ...options,
          type: 'html',
          download: false,
          remote: false,
          print: true,
        };
        const title = opts.sheetName || document.title || '';
        return exportData(opts).then((res: any) => {
          const html = res?.content || '';
          const beforePrintMethod = opts.beforePrintMethod;
          const printMethod = opts.printMethod;
          return Promise.resolve(
            beforePrintMethod
              ? beforePrintMethod({
                  html,
                  content: html,
                  options: opts,
                  $table: $asTable,
                })
              : true,
          ).then((rest: any) => {
            const finalHtml = rest && typeof rest === 'string' ? rest : html;
            if (printMethod) {
              return printMethod({
                html: finalHtml,
                content: finalHtml,
                options: opts,
                $table: $asTable,
              });
            }
            const win = window.open('', '', 'width=800,height=600');
            if (!win) {
              return { status: false, msg: 'print window blocked' };
            }
            win.document.write(
              createHtmlPage({ ...opts, sheetName: title }, finalHtml),
            );
            win.document.close();
            win.focus();
            win.print();
            return { status: true };
          });
        });
      };

      const getPrintHtml = (options?: AsTablePropTypes.PrintConfig) => {
        const printOpts = computePrintOpts.value;
        return print({
          ...printOpts,
          ...options,
        })
          .catch(() => undefined)
          .then((res: any) => {
            return { html: res?.content || '' };
          });
      };

      const closeExport = () => {
        reactData.exportStore.visible = false;
        reactData.initStore.export = false;
        return Promise.resolve();
      };

      const closeImport = () => {
        reactData.importStore.visible = false;
        reactData.initStore.import = false;
        return Promise.resolve();
      };

      const openExport = (options?: AsTablePropTypes.ExportConfig) => {
        const exportOpts = computeExportOpts.value;
        handleExportAndPrint({ ...exportOpts, ...options });
      };

      const openPrint = (options?: AsTablePropTypes.PrintConfig) => {
        const printOpts = computePrintOpts.value;
        handleExportAndPrint({ ...printOpts, ...options }, true);
      };

      const openImport = (options?: AsTablePropTypes.ImportConfig) => {
        const importOpts = computeImportOpts.value;
        const opts: any = { ...importOpts, ...options };
        const typeList = keys(importOpts._typeMaps || { csv: 1, txt: 1 }).map(
          (value: string) => ({
            value,
            label: t(
              `importType${value.charAt(0).toUpperCase()}${value.slice(1)}`,
              value.toUpperCase(),
            ),
          }),
        );
        const modeList = (opts.modes || ['insertTop', 'covering']).map(
          (value: string) => ({
            value,
            label: t(
              `importMode${value.charAt(0).toUpperCase()}${value.slice(1)}`,
              value,
            ),
          }),
        );
        Object.assign(reactData.importStore, {
          visible: true,
          file: null,
          filename: '',
          type: '',
          typeList,
          modeList,
        });
        Object.assign(reactData.importParams, opts, {
          mode: opts.mode || modeList[0]?.value || 'insertTop',
        });
        reactData.initStore.import = true;
      };

      const importByFile = (
        file: File,
        options?: AsTablePropTypes.ImportConfig,
      ) => handleImport(file, options || {});

      const importData = (options?: AsTablePropTypes.ImportConfig) =>
        readFile({ types: ['csv', 'txt', 'html', 'xml'] }).then((params) =>
          importByFile(params.file, options),
        );

      const exportMethods: TableExportMethods = {
        exportData,
        print,
        getPrintHtml,
        openExport,
        openPrint,
        closeExport,
        closePrint: closeExport,
        openImport,
        closeImport,
        importByFile,
        importData,
        saveFile,
        readFile,
      };

      return exportMethods;
    },
  });
}

tableExportModule();
