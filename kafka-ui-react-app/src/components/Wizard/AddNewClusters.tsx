import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';

const AddCluster = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;
const AddNewClusters: React.FC = () => (
  <AddCluster>
    <PageHeading text="Clusters" />
    <Button buttonType="primary" buttonSize="M">
      Add New
    </Button>
  </AddCluster>
);

export default AddNewClusters;
