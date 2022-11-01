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
  max-width: 400px;
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

export const Source = styled.div`
  display: flex;
  align-content: center;
  svg {
    margin-left: 10px;
    vertical-align: middle;
    cursor: pointer;
  }
`;
