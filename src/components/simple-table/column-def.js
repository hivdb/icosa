import sortBy from 'lodash/sortBy';
import startCase from 'lodash/startCase';


export default class ColumnDef {

  constructor({
    name, label, render, renderConfig = {}, sort,
    sortable = true, textAlign = 'center',
    none = '?', multiCells = false,
    headCellStyle = {}, bodyCellStyle = {}
  }) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === undefined ||
        cellData === null ||
        cellData === '') ? none : cellData
    );
    this.renderConfig = renderConfig;
    this.sort = sort ? sort : data => sortBy(data, [name]);
    this.sortable = Boolean(sortable);
    this.textAlign = textAlign;
    this.multiCells = multiCells;
    this.headCellStyle = headCellStyle;
    this.bodyCellStyle = bodyCellStyle;
  }

}
