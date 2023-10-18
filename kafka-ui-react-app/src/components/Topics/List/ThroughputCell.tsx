import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Topic } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import CircleArrowDownIcon from 'components/common/Icons/CircleArrowDownIcon';
import CircleArrowUpIcon from 'components/common/Icons/CircleArrowUpIcon';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  span {
    display: flex;
    align-items: center;
    &:first-child {
      margin-right: 10px;
    }
    & > svg {
      margin-right: 5px;
    }
  }
`;
export const ThroughputCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
}) => {
  const production = original.bytesInPerSec;
  const consumption = original.bytesOutPerSec;

  const isUndefinedProductionConsumption =
    production === undefined && consumption === undefined;

  const circleArrowDownIcon = (isUndefinedProductionConsumption ||
    production !== undefined) && (
    <span>
      <CircleArrowDownIcon />
      {(isUndefinedProductionConsumption && 'N/A') || (
        <BytesFormatted value={production} />
      )}
    </span>
  );
  const circleArrowUpIcon = (isUndefinedProductionConsumption ||
    consumption !== undefined) && (
    <span>
      <CircleArrowUpIcon />
      {(isUndefinedProductionConsumption && 'N/A') || (
        <BytesFormatted value={consumption} />
      )}
    </span>
  );

  return (
    <Wrapper>
      {circleArrowDownIcon} {circleArrowUpIcon}
    </Wrapper>
  );
};
