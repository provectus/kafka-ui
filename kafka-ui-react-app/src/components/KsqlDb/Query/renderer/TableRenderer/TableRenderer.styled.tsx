import styled from 'styled-components';
import { Table } from 'components/common/table/Table/Table.styled';

export const Wrapper = styled.div`
  display: block;
  padding: 1.25rem;
  border-radius: 6px;
  overflow-y: scroll;
`;

export const ScrollableTable = styled(Table)`
  overflow-y: scroll;
`;
