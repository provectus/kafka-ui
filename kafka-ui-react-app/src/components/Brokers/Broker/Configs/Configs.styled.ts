import styled from 'styled-components';

export const ValueWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  button {
    margin: 0 10px;
  }
`;

export const Value = styled.span`
  line-height: 24px;
  margin-right: 10px;
  text-overflow: ellipsis;
  width: 600px;
  overflow: hidden;
  white-space: nowrap;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
`;
export const SearchWrapper = styled.div`
  margin: 10px;
  width: 21%;
`;
