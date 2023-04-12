import styled from 'styled-components';

export const EnumCell = styled.div`
  text-transform: capitalize;
`;

export const DeleteCell = styled.div`
  svg {
    cursor: pointer;
  }
`;

export const Chip = styled.div<{ chipType?: 'default' | 'success' | 'danger' }>`
  width: fit-content;
  text-transform: capitalize;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 16px;
  background-color: ${({ theme, chipType }) => {
    switch (chipType) {
      case 'success':
        return theme.acl.table.chipColors.green;
      case 'danger':
        return theme.acl.table.chipColors.red;
      default:
        return theme.acl.table.chipColors.gray;
    }
  }};
`;

export const PatternCell = styled.div`
  display: flex;
  align-items: center;

  ${Chip} {
    margin-left: 4px;
  }
`;
