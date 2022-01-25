import styled, { css } from 'styled-components';
import React from 'react';

interface Props {
  text: string;
  className?: string;
}

const PageHeading: React.FC<Props> = ({ text, className, children }) => {
  return (
    <div className={className}>
      <h1>{text}</h1>
      <div>{children}</div>
    </div>
  );
};

export default styled(PageHeading)(
  ({ theme }) => css`
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 16px;
    & h1 {
      font-size: 24px;
      font-weight: 500;
      line-height: 32px;
      color: ${theme.headingStyles.h1.color};
    }
    & > div {
      display: flex;
      gap: 16px;
    }
  `
);
