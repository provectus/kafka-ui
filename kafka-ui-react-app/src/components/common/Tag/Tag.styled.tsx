import styled from 'styled-components';
import React from 'react';

interface Props {
  className?: string;
  color: 'green' | 'gray' | 'yellow';
}

const Tag: React.FC<Props> = ({ className, children }) => {
  return <p className={className}>{children}</p>;
};

export default styled(Tag)`
  border: none;
  border-radius: 16px;
  height: 20px;
  line-height: 20px;
  background-color: ${(props) =>
    props.theme.tagStyles.backgroundColor[props.color]};
  color: ${(props) => props.theme.tagStyles.color};
  font-size: 12px;
  display: inline-block;
  padding-left: 0.75em;
  padding-right: 0.75em;
  text-align: center;
`;
