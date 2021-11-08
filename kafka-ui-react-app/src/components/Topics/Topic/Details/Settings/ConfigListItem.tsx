import { TopicConfig } from 'generated-sources';
import styled from 'styled-components';
import React from 'react';
import { Colors } from 'theme/theme';

interface ListItemProps {
  config: TopicConfig;
}

const ConfigListItemStyled = styled.tr`
  & > td:last-child {
    color: ${Colors.neutral[30]};
  }
`;
const ConfigListItemCellStyled = styled.td<{ hasCustomValue: boolean }>`
  font-weight: ${(props) => (props.hasCustomValue ? 500 : 400)};
`;

const ConfigListItem: React.FC<ListItemProps> = ({
  config: { name, value, defaultValue },
}) => {
  const hasCustomValue = value !== defaultValue;

  return (
    <ConfigListItemStyled>
      <ConfigListItemCellStyled hasCustomValue>{name}</ConfigListItemCellStyled>
      <ConfigListItemCellStyled hasCustomValue>
        {value}
      </ConfigListItemCellStyled>
      <td className="has-text-grey" title="Default Value">
        {hasCustomValue && defaultValue}
      </td>
    </ConfigListItemStyled>
  );
};

export default ConfigListItem;
