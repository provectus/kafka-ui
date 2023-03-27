import React from 'react';
import Heading from 'components/common/heading/Heading.styled';
import styled from 'styled-components';

export const TableTitle = styled((props) => <Heading level={3} {...props} />)`
  padding: 16px 16px 0;
`;
