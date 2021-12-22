import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const SchemaVersionWrapper = styled.tr`
  background-color: ${Colors.neutral[5]};
  & > td {
    padding: 16px !important;
    & > div {
      background-color: ${Colors.neutral[0]};
      border-radius: 8px;
      padding: 24px;
    }
  }
`;

export const OldVersionsTitle = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 16px;
`;
