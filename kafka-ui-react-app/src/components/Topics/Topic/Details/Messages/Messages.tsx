import React from 'react';

import FiltersContainer from './Filters/FiltersContainer';
import MessagesTable from './MessagesTable';

const Messages: React.FC = () => (
  <div className="box">
    <FiltersContainer />
    <MessagesTable />
  </div>
);

export default Messages;
