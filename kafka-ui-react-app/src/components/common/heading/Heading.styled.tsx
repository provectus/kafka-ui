import React from 'react';
import styled from 'styled-components';

interface Props {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const HeadingBase = styled.h1``;

const Heading: React.FC<Props> = ({ level = 1, ...rest }) => {
  return <HeadingBase as={`h${level}`} {...rest} />;
};

export default Heading;
