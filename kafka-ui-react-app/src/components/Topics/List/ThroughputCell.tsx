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

  if (production === undefined && consumption === undefined) {
    return (
      <Wrapper>
        <span>
          <CircleArrowDownIcon />
          N/A
        </span>
        <span>
          <CircleArrowUpIcon />
          N/A
        </span>
      </Wrapper>
    );
  }
  if (production === undefined) {
    return (
      <Wrapper>
        <span>
          <CircleArrowUpIcon /> <BytesFormatted value={consumption} />
        </span>
      </Wrapper>
    );
  }
  if (consumption === undefined) {
    return (
      <Wrapper>
        <span>
          <CircleArrowDownIcon /> <BytesFormatted value={production} />
        </span>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <span>
        <CircleArrowDownIcon /> <BytesFormatted value={production} />
      </span>
      <span>
        <CircleArrowUpIcon /> <BytesFormatted value={consumption} />
      </span>
    </Wrapper>
  );
};
