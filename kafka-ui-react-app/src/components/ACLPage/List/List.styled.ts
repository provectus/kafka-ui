import styled from 'styled-components';

export const EnumCell = styled.div`
  text-transform: capitalize;
`;

export const DeleteCell = styled.div`
  svg {
    cursor: pointer;
  }
`;

export const Chip = styled.div<{
  chipType?: 'default' | 'success' | 'danger' | 'secondary' | string;
}>`
  width: fit-content;
  text-transform: capitalize;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 16px;
  color: ${({ theme }) => theme.tag.color};
  background-color: ${({ theme, chipType }) => {
    switch (chipType) {
      case 'success':
        return theme.tag.backgroundColor.green;
      case 'danger':
        return theme.tag.backgroundColor.red;
      case 'secondary':
        return theme.tag.backgroundColor.secondary;
      default:
        return theme.tag.backgroundColor.gray;
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
