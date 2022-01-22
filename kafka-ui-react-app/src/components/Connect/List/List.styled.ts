import styled from 'styled-components';

export const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const Dropdown = styled.span`
  color: ${({ theme }) => theme.dropdown.color};
`;
