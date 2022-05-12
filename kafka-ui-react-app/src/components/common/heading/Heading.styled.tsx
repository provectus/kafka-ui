import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
interface HeadingBaseProps {
  $level: HeadingLevel;
}
const HeadingBase = styled.h1<HeadingBaseProps>`
  ${({ theme }) => theme.heading?.base}
  ${({ theme, $level }) => theme.heading?.variants[$level]}
`;

export interface Props {
  level?: HeadingLevel;
}
const Heading: React.FC<PropsWithChildren<Props>> = ({
  level = 1,
  ...rest
}) => {
  return <HeadingBase as={`h${level}`} $level={level} {...rest} />;
};

export default Heading;
