export interface ITableSchema {
    shcemaName: string;
    columns: ITableSchemaColumn[];
}

export interface ITableSchemaColumn {
    name: string;
    type: string;
}

export interface ITableSchemaAction {
    name: string;
    type: string;
}

export enum TableSchemaColumnType {
    text = 'text',
    date = 'date',
    actionButtons = 'actionButtons',
}

export enum TableSchemaActionType {
    edit = 'edit',
    delete = 'delete',
    duplicate = 'duplicate',
}