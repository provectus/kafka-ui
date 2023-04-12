import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { InputHint } from 'components/common/Input/Input.styled';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import { KafkaAclNamePatternTypeEnum } from 'generated-sources';

import * as S from './Create.styled';
import { topicOptions } from './util';

const Producers: React.FC = () => {
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  const { watch } = useFormContext();
  return (
    <>
      <S.CreateLabel id="pattern">
        To topic(s)
        <div>
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
                      watch('namePatternType') ===
                      KafkaAclNamePatternTypeEnum.LITERAL
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
                watch('namePatternType') ===
                KafkaAclNamePatternTypeEnum.PREFIXED
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
          <MultiSelect
            minWidth="320px"
            height="40px"
            labelledBy="Select topics"
            options={topicOptions}
            value={selectedTopics}
            onChange={setSelectedTopics}
            disableSearch
            hasSelectAll={false}
          />
        </div>
      </S.CreateLabel>
      <S.CreateLabel id="pattern">
        Transaction ID
        <div>
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
                      watch('namePatternType') ===
                      KafkaAclNamePatternTypeEnum.LITERAL
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
                watch('namePatternType') ===
                KafkaAclNamePatternTypeEnum.PREFIXED
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
          <S.CreateInput placeholder="Placeholder" />
        </div>
      </S.CreateLabel>
      <S.Divider />
      <S.CreateLabel isCheckbox>
        <input type="checkbox" name="idempotent" id="idempotent" />
        Idempotent
        <InputHint>Check if it using enable idempotence=true</InputHint>
      </S.CreateLabel>
    </>
  );
};

export default Producers;
