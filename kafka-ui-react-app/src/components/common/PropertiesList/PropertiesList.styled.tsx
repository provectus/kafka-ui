import styled from 'styled-components';

export const List = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  gap: 8px;
  column-gap: 24px;
  margin: 16px 0;
  text-align: left;
`;

export const Label = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.default.color.normal};
  white-space: nowrap;
`;
