import styled from 'styled-components';

const IconButtonWrapper = styled.span.attrs(() => ({
  role: 'button',
  tabIndex: '0',
}))`
  height: 16px !important;
  display: inline-block;
  &:hover {
    cursor: pointer;
  }
`;

export default IconButtonWrapper;
