import StyledClusterTab from 'components/Nav/ClusterMenuItem/ClusterTab/ClusterTab.styled';
import { ServerStatus } from 'generated-sources';
import React from 'react';
import ClusterStatusIcon from 'components/Nav/ClusterStatusIcon';
import DefaultClusterIcon from 'components/Nav/DefaultClusterIcon';

import ClusterTabChevron from './ClusterTabChevron';

export interface ClusterTabProps {
  to: string;
  activeClassName?: string;
  title?: string;
  exact?: boolean;
  isActive?: (match: unknown, location: Location) => boolean;
  status: ServerStatus;
  defaultCluster?: boolean;
  isOpen: boolean;
  toggleClusterMenu: () => void;
}

const ClusterTab: React.FC<ClusterTabProps> = ({
  status,
  title,
  defaultCluster,
  isOpen,
  toggleClusterMenu,
}) => {
  return (
    <StyledClusterTab onClick={() => toggleClusterMenu()}>
      <div className="cluster-tab-wrapper">
        <div className="cluster-tab-l">
          {defaultCluster && <DefaultClusterIcon />}
          {title}
          <ClusterStatusIcon status={status} />
        </div>
        <ClusterTabChevron isOpen={isOpen} />
      </div>
    </StyledClusterTab>
  );
};

export default ClusterTab;
