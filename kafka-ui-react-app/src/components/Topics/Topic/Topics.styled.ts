import styled from 'styled-components';

export const FloatingSidebar = styled.div<{ $visible: boolean }>`
  background-color: #fff;
  position: fixed;
  top: 50px;
  right: -70vw;
  bottom: 0px;
  width: 70vw;
  box-shadow: -2px -2px 10px rgba(0, 0, 0, 0.2);
  ${({ $visible }) => ($visible ? `right: 0px;` : '')}
  transition: right 0.3s ease-in-out;
`;
