import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ACList from 'components/ACLPage/List/List';

const ACLPage = () => {
  return (
    <Routes>
      <Route index element={<ACList />} />
    </Routes>
  );
};

export default ACLPage;
