import React from 'react';
import styled from 'styled-components';

interface CellProps {
  isWarning?: boolean;
  isAttention?: boolean;
}

interface ColoredCellProps {
  value: number | string;
  warn?: boolean;
  attention?: boolean;
}

const Cell = styled.div<CellProps>`
  color: ${(props) => {
    if (props.isAttention) {
      return props.theme.table.colored.color.attention;
    }

    if (props.isWarning) {
      return props.theme.table.colored.color.warning;
    }

    return 'inherit';
  }};
`;

const ColoredCell: React.FC<ColoredCellProps> = ({
  value,
  warn,
  attention,
}) => {
  return (
    <Cell isWarning={warn} isAttention={attention}>
      {value}
    </Cell>
  );
};

export default ColoredCell;
