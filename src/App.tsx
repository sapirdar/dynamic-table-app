import React, { Component } from 'react';
import './App.scss';
import DataTable from './components/DataTable/DataTable';

class App extends Component {
  render() {
    return (
      <div className="container p-5">
        <DataTable schemaName="promotions"  />
      </div>
    );
  }

}

export default App;
