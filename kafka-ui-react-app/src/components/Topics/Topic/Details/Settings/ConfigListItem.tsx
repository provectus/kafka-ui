import { TopicConfig } from 'generated-sources';
import React from 'react';

import * as S from './Settings.styled';

interface ListItemProps {
  config: TopicConfig;
}

const ConfigListItem: React.FC<ListItemProps> = ({
  config: { name, value, defaultValue },
}) => {
  const hasCustomValue = value !== defaultValue;

  return (
    <S.ConfigList>
      <S.ConfigItemCell $hasCustomValue>{name}</S.ConfigItemCell>
      <S.ConfigItemCell $hasCustomValue>{value}</S.ConfigItemCell>
      <td className="has-text-grey" title="Default Value">
        {hasCustomValue && defaultValue}
      </td>
    </S.ConfigList>
  );
};

export default ConfigListItem;
