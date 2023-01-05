import React, { MouseEventHandler, SyntheticEvent } from 'react';
import styled from 'styled-components';

interface BackdropProps {
  onClick?: (e: SyntheticEvent<HTMLElement>) => void;
  open?: boolean;
}

const BackdropStyled = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(23, 26, 28, 0.6);
`;

const Backdrop: React.FC<BackdropProps> = ({ open, onClick }) => {
  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
    if (e.target !== e.currentTarget) {
      return;
    }
    onClick?.(e);
  };

  return open ? (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <BackdropStyled onClick={handleClick} />
  ) : null;
};

export default Backdrop;
