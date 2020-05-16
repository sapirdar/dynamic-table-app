import { ITableSchema } from "../interfaces/tableSchema";

class ApiService {
    apiBaseUrl = 'http://localhost:5000/api'; // Should be moved to external config file / env variables 

    generateSchema(): Promise<ITableSchema> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        };
        return fetch(`${this.apiBaseUrl}/tableSchema`, requestOptions)
            .then(async response => {
                const data = await response.json();
                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response statusText
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                else {
                    return Promise.resolve(data);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
                return Promise.reject(error);
            });
    }

    getSchema(schemaName: string): Promise<any> {
        return fetch(`${this.apiBaseUrl}/tableSchema/${schemaName}`)
            .then(async response => {
                const data = await response.json();
                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response statusText
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                else {
                    return Promise.resolve(data);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
                return Promise.reject(error);
            });
    }

    generateData(): Promise<ITableSchema> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        };
        return fetch(`${this.apiBaseUrl}/api/tableData`, requestOptions)
            .then(async response => {
                const data = await response.json();
                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response statusText
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                else {
                    return Promise.resolve(data);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
                return Promise.reject(error);
            });
    }

    getPage(start: number, count: number): Promise<any> {
        return fetch(`${this.apiBaseUrl}/tableData/${start}/${count}`)
            .then(async response => {
                const data = await response.json();
                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response statusText
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                else {
                    return Promise.resolve(data);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
                return Promise.reject(error);
            });
    }
}

export default ApiService;
