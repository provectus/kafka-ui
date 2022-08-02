import React from 'react';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

import { Wrapper, ToggleButton } from './TraceCell.styled';

interface Props {
  stackTrace: string;
}

const MAX_LENGTH = 100;

const TraceCell: React.FC<Props> = ({ stackTrace }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const truncate = (str: string) => {
    return str.length > MAX_LENGTH
      ? `${str.substring(0, MAX_LENGTH - 3)}...`
      : str;
  };

  return (
    <Wrapper>
      {stackTrace.length > MAX_LENGTH && (
        <ToggleButton>
          <IconButtonWrapper onClick={() => setIsOpen(!isOpen)} aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </ToggleButton>
      )}

      {isOpen ? stackTrace : truncate(stackTrace)}
    </Wrapper>
  );
};

export default TraceCell;
