import { TopicConfig } from 'generated-sources';
import React from 'react';

import * as S from './Settings.styled';

export interface ListItemProps {
  config: TopicConfig;
}

const ConfigListItem: React.FC<ListItemProps> = ({
  config: { name, value, defaultValue },
}) => {
  const hasCustomValue = !!defaultValue && value !== defaultValue;

  return (
    <S.Row $hasCustomValue={hasCustomValue}>
      <td>{name}</td>
      <td>{value}</td>
      <td title="Default Value">{hasCustomValue && defaultValue}</td>
    </S.Row>
  );
};

export default ConfigListItem;
