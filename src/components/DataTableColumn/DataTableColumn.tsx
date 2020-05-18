import React, { Component } from 'react';
import './DataTableColumn.scss';
import { ITableSchemaColumn, TableSchemaColumnType } from '../../interfaces/tableSchema';


type DataTableColumnProps = {
  dataObject: any;
  col: ITableSchemaColumn
}

class DataTableColumn extends Component<DataTableColumnProps, {}> {
  render() {
    return (this.renderColumn())
  }

  private renderColumn = () => {
    let key = this.props.col.name.split(" ").join('_');
    let value = this.props.dataObject[key]
    switch (this.props.col.type) {
      case TableSchemaColumnType.date:
        let formatted = Intl.DateTimeFormat('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
        return formatted;
      case TableSchemaColumnType.actionButtons:
        return (
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle" type="button" id={this.props.dataObject._id} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Actions
            </button>
            <div className="dropdown-menu" aria-labelledby={this.props.dataObject._id}>
              {value.map((action: string) => <button key={action + '_' + this.props.dataObject._id} className="dropdown-item">{action}</button>)}
            </div>
          </div>
        )
      default:
        return value;
    }
  }
}
export default DataTableColumn;
