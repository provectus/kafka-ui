import Select from 'components/common/Select/Select';
import styled from 'styled-components';

export const SerdeSelectWrapper = styled.div`
  display: inline-block;
  float: right;
`;

export const SerdeSelect = styled(Select)`
  border: none;
  gap: 0;
  width: fit-content;
  padding: 0;
  height: unset;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0;
  text-align: right;
  background: ${({ theme }) => theme.table.th.backgroundColor.normal};
  color: ${({ theme }) => theme.table.th.previewColor.normal};
`;
