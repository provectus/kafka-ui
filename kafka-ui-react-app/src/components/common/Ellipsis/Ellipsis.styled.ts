import styled from 'styled-components';

export const Text = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 340px;
`;

export const Wrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
