import React, { Component, RefObject } from 'react';
import './DataTable.scss';
import { ITableSchema, ITableSchemaColumn } from '../../interfaces/tableSchema';
import ApiService from '../../services/api.service';
import { Waypoint } from 'react-waypoint';
import DataTableColumn from '../DataTableColumn/DataTableColumn';
import SystemMessage from '../SystemMessage/SystemMessage';

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
      <h3 className="text-center pb-5">Dynamic Data Table</h3>
        <div className="row">
          <div className="col text-center">
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
                    {this.state.tableSchema?.columns.map((col: ITableSchemaColumn, index: number) => (
                      <th scope="col" key={'th_' + index}>{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody ref={this.tableRef}>
                  {this.state.tableData.length > 0 && this.state.page > this.state.pageSize ?
                    <tr className="scroll-waypoint">
                      <td colSpan={this.state.tableSchema?.columns.length + 1}>
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
                  {this.state.tableData?.map((dataObject: any, rowIndex: number) => (
                    <tr key={'row_' + rowIndex.toString()}>
                      <td className="checkbox"><input type="checkbox" /></td>
                      {this.state.tableSchema?.columns.map((col: ITableSchemaColumn, colIndex: number) => (
                        <td key={'row_' + rowIndex.toString() + 'col_' + colIndex.toString()}>
                          <DataTableColumn dataObject={dataObject} col={col} />
                        </td>
                      ))}
                    </tr>
                  )
                  )}
                  {this.state.tableData.length > 0 ?
                    <tr className="scroll-waypoint">
                      <td colSpan={this.state.tableSchema?.columns.length + 1}>
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
        {this.state.isError ? <SystemMessage type="danger" text="Error occurred, please try again." /> : null}
      </div>
    );
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
    this.updateState({ isSchemaGenerating: true, isError: false });
    this.apiService.generateSchema().then((data: ITableSchema) => {
      this.updateState({ isSchemaGenerating: false });
      this.updateState({ tableSchema: data });
    }).catch((e) => {
      this.updateState({ isSchemaGenerating: false, isError: true });
    });
  }

  private getSchema = () => {
    this.updateState({ isError: false });
    this.apiService.getSchema(this.props.schemaName).then((data: ITableSchema) => {
      this.updateState({ tableSchema: data });
    }).catch((e) => {
      this.updateState({ isError: true });
    });
  }

  private generateData = () => {
    this.updateState({ isDataGenerating: true, isError: false });
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
      this.updateState({ isLazyLoading: true, isError: false });
    } else {
      this.updateState({ isDataLoading: true, isError: false });
    }

    if (!this.state.tableSchema) {
      this.getSchema();
    }

    this.apiService.getData(this.props.schemaName, this.state.page - 1, this.state.pageSize).then((data) => {
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
