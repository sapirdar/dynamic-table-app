import React, { Component, RefObject } from 'react';
import './DataTable.scss';
import { ITableSchema, ITableSchemaColumn, TableSchemaColumnType } from '../../interfaces/tableSchema';
import ApiService from '../../services/api.service';
import { Waypoint } from 'react-waypoint';

type DataTableState = {
  tableData: any[];
  tableSchema: ITableSchema | null;
  isLazyLoading: boolean,
  isDataLoading: boolean,
  lazyLoadMode: 'none' | 'prev' | 'next', // Define lazy load direction (scrolled up / down)
  isDataGenerating: boolean,
  isSchemaGenerating: boolean,
  isError: boolean,
  pageSize: number,
  page: number,
}

type DataTableProps = {
  schemaName: string;
}

class DataTable extends Component<DataTableProps, DataTableState> {
  apiService = new ApiService();
  tableRef: RefObject<any> = React.createRef();
  constructor(p: DataTableProps) {
    super(p);
    this.state = {
      tableData: [],
      tableSchema: null,
      isLazyLoading: false,
      isDataLoading: false,
      isDataGenerating: false,
      isSchemaGenerating: false,
      isError: false,
      pageSize: 100,
      page: 1,
      lazyLoadMode: 'none'
    };
  }

  render() {
    return (
      <div className="data-table">
        <div className="row">
          <div className="col">
            <button className="btn btn-info m-3" onClick={this.generateSchema}>Generate Schema
              {this.state.isSchemaGenerating ? <span className="spinner-border spinner-border-sm ml-2" role="status" aria-hidden="true"></span> : null}
            </button>
            <button className="btn btn-info m-3" onClick={this.generateData}>Generate Data
              {this.state.isDataGenerating ? <span className="spinner-border spinner-border-sm ml-2" role="status" aria-hidden="true"></span> : null}
            </button>
            <button className="btn btn-info m-3" onClick={this.getData}>Get Data
            {this.state.isDataLoading ? <span className="spinner-border spinner-border-sm ml-2" role="status" aria-hidden="true"></span> : null}
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            {this.state.tableSchema ?
              <table className="table">
                <thead>
                  <tr>
                    <th className="checkbox">Select</th>
                    {this.state.tableSchema?.columns.map((col: ITableSchemaColumn) => (
                      <th scope="col" key={'th_' + col.name}>{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody ref={this.tableRef}>
                  {this.state.tableData.length > 0 && this.state.page > this.state.pageSize ?
                    <tr className="scroll-waypoint">
                      <td>
                        <Waypoint onEnter={() => { this.handleWaypointEnter(true) }} />
                        {this.state.isLazyLoading && this.state.lazyLoadMode === 'prev' ?
                          <div className="text-center spinner">
                            <div className="spinner-border" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div> : null}
                      </td>
                    </tr>
                    : null}
                  {this.state.tableData?.map((row: any, rowIndex: number) => (
                    <tr key={'row_' + rowIndex.toString()}>
                      <td className="checkbox"><input type="checkbox" /></td>
                      {this.state.tableSchema?.columns.map((col: ITableSchemaColumn, colIndex: number) => (
                        <td key={'row_' + rowIndex.toString() + 'col_' + colIndex.toString()}> {this.renderColumn(row, col, rowIndex)}</td>
                      ))}
                    </tr>
                  )
                  )}
                  {this.state.tableData.length > 0 ?
                    <tr className="scroll-waypoint">
                      <td>
                        {this.state.isLazyLoading && this.state.lazyLoadMode === 'next' ?
                          <div className="text-center spinner">
                            <div className="spinner-border" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div> : null}
                        <Waypoint onEnter={() => { this.handleWaypointEnter(false) }} />
                      </td>
                    </tr>
                    : null}
                </tbody>
              </table>
              : null}
          </div>
        </div>
        {this.state.isError ?
          <div className="messages">
            <div className="alert alert-danger" role="alert">
              <span className="mr-2">Error occured, please try again.</span>
              <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button></div>
          </div>
          : null}

      </div>
    );
  }

  private renderColumn(row: any, col: ITableSchemaColumn, rowIndex: number) {
    let key = col.name.split(" ").join('_');
    let value = row[key]
    switch (col.type) {
      case TableSchemaColumnType.date:
        let formatted = Intl.DateTimeFormat('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
        return formatted;
      case TableSchemaColumnType.actionButtons:
        const elementId = `${key}_${rowIndex}_menu`;
        return (
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle" type="button" id={elementId} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Actions
              </button>
            <div className="dropdown-menu" aria-labelledby={elementId}>
              {value.map((action: string) => <button key={action + '_' + elementId} className="dropdown-item">{action}</button>)}
            </div>
          </div>
        )
      default:
        return value;
    }
  }

  handleWaypointEnter = (isFirst: boolean) => {
    if (isFirst && this.state.page > this.state.pageSize) {
      this.updateState({ page: this.state.page - this.state.pageSize, lazyLoadMode: 'prev' })
      this.getData();
    }
    else if (!isFirst) {
      this.updateState({ page: this.state.page + this.state.pageSize, lazyLoadMode: 'next' });
      this.getData();
    }
  }

  private generateSchema = () => {
    this.updateState({ isSchemaGenerating: true });
    this.apiService.generateSchema().then((data: ITableSchema) => {
      this.updateState({ isSchemaGenerating: false });
      this.updateState({ tableSchema: data });
    }).catch((e) => {
      this.updateState({ isSchemaGenerating: false, isError: true });
    });
  }

  private getSchema = () => {
    this.apiService.getSchema(this.props.schemaName).then((data: ITableSchema) => {
      this.updateState({ tableSchema: data });
    }).catch((e) => {
      this.updateState({ isError: true });
    });
  }

  private generateData = () => {
    this.updateState({ isDataGenerating: true });
    this.apiService.generateData().then((isSuccess) => {
      this.updateState({ isDataGenerating: false });
      if (isSuccess) {
        this.getData();
      }
    }).catch((e) => {
      this.updateState({ isDataGenerating: false, isError: true });
    });
  }

  private getData = () => {
    if (this.state.lazyLoadMode !== 'none') {
      this.updateState({ isLazyLoading: true });
    } else {
      this.updateState({ isDataLoading: true });
    }

    if (!this.state.tableSchema) {
      this.getSchema();
    }

    this.apiService.getPage(this.state.page - 1, this.state.pageSize).then((data) => {
      this.updateState({ isLazyLoading: false, isDataLoading: false });
      this.updateState({ tableData: data });

      // Scroll for lazy loading
      if (this.state.lazyLoadMode === 'next') {
        this.tableRef.current.scrollBy(0, -200);
        this.updateState({ lazyLoadMode: 'none' });
      } else if (this.state.lazyLoadMode === 'prev' && this.state.page > this.state.pageSize) {
        this.tableRef.current.scrollBy(0, 200);
        this.updateState({ lazyLoadMode: 'none' });
      }
    }).catch((e) => {
      this.updateState({ isLazyLoading: false, isDataLoading: false, isError: true });
    });
  }

  private updateState(data: any) {
    this.setState(Object.assign(this.state, data));
  }

}

export default DataTable;
