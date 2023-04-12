import React from 'react';

import * as S from './Create.styled';

const RadioGroup: React.FC = () => {
  return (
    <S.CreateButtonGroup role="group">
      <S.CreateCheckboxLabeled
        isPattern="exact"
        active={
          watch('namePatternType') === KafkaAclNamePatternTypeEnum.LITERAL
        }
      >
        <Controller
          name="namePatternType"
          render={({ field: { onChange } }) => (
            <S.CreateButton
              type="radio"
              value={KafkaAclNamePatternTypeEnum.LITERAL}
              checked={
                watch('namePatternType') === KafkaAclNamePatternTypeEnum.LITERAL
              }
              onChange={onChange}
            />
          )}
        />
        Exact
      </S.CreateCheckboxLabeled>
      <S.CreateCheckboxLabeled
        isPattern="prefix"
        active={
          watch('namePatternType') === KafkaAclNamePatternTypeEnum.PREFIXED
        }
      >
        <Controller
          name="namePatternType"
          render={({ field: { onChange } }) => (
            <S.CreateButton
              type="radio"
              value={KafkaAclNamePatternTypeEnum.PREFIXED}
              checked={
                watch('namePatternType') ===
                KafkaAclNamePatternTypeEnum.PREFIXED
              }
              onChange={onChange}
            />
          )}
        />
        Prefixed
      </S.CreateCheckboxLabeled>
    </S.CreateButtonGroup>
  );
};

export default RadioGroup;