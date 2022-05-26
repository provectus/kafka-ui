import styled from 'styled-components';
import React, { PropsWithChildren } from 'react';
import Heading from 'components/common/heading/Heading.styled';

interface Props {
  text: string;
  className?: string;
}

const PageHeading: React.FC<PropsWithChildren<Props>> = ({
  text,
  className,
  children,
}) => {
  return (
    <div className={className}>
      <Heading>{text}</Heading>
      <div>{children}</div>
    </div>
  );
};

export default styled(PageHeading)`
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;

  & > div {
    display: flex;
    gap: 16px;
  }
`;
