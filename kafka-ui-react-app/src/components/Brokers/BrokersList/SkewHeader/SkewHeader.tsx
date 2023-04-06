import React from 'react';
import Tooltip from 'components/common/Tooltip/Tooltip';
import InfoIcon from 'components/common/Icons/InfoIcon';

import * as S from './SkewHeader.styled';

const SkewHeader: React.FC = () => (
  <S.CellWrapper>
    Partitions skew
    <Tooltip
      value={<InfoIcon />}
      content="The divergence from the average brokers' value"
    />
  </S.CellWrapper>
);

export default SkewHeader;
