import React from 'react';
import { ServerStatus } from 'generated-sources';

import * as S from './ClusterTab.styled';

export interface ClusterTabProps {
  title?: string;
  status: ServerStatus;
  isOpen: boolean;
  toggleClusterMenu: () => void;
}

const ClusterTab: React.FC<ClusterTabProps> = ({
  status,
  title,
  isOpen,
  toggleClusterMenu,
}) => (
  <S.Wrapper onClick={toggleClusterMenu}>
    <S.Title title={title}>{title}</S.Title>

    <S.StatusIconWrapper>
      <S.StatusIcon status={status} aria-label="status">
        <title>{status}</title>
      </S.StatusIcon>
    </S.StatusIconWrapper>

    <S.ChevronWrapper>
      <S.ChevronIcon $open={isOpen} />
    </S.ChevronWrapper>
  </S.Wrapper>
);

export default ClusterTab;
