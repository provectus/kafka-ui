import styled from 'styled-components';
import { Table } from 'components/common/table/Table/Table.styled';

export const Wrapper = styled.div`
  display: block;
  overflow-y: scroll;
`;

export const ScrollableTable = styled(Table)`
  overflow-y: scroll;
  width: 100%;

  td {
    vertical-align: top;
  }
`;
