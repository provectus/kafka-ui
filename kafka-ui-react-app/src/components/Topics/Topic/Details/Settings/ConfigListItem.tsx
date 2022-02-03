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
    <S.ConfigList>
      <S.ConfigItemCell $hasCustomValue={hasCustomValue}>
        {name}
      </S.ConfigItemCell>
      <S.ConfigItemCell $hasCustomValue={hasCustomValue}>
        {value}
      </S.ConfigItemCell>
      <td className="has-text-grey" title="Default Value">
        {hasCustomValue && defaultValue}
      </td>
    </S.ConfigList>
  );
};

export default ConfigListItem;
