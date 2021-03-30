import React from 'react';
import Dashboard from './containers/Dashboard'
import {initialize} from './db';

function App() {
  initialize();
  return (
    <div>
      <Dashboard></Dashboard>
    </div>
  );
}

export default App;
