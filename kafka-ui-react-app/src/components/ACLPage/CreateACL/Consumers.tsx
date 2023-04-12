import React from 'react';
import { KafkaAclNamePatternTypeEnum } from 'generated-sources';
import { Controller, useFormContext } from 'react-hook-form';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import Select from 'components/common/Select/Select';

import * as S from './Create.styled';
import { topicOptions } from './util';

const ConsumersACL: React.FC = () => {
  const { watch } = useFormContext();
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  return (
    <>
      <S.CreateLabel id="pattern">
        From topic(s)
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
        Consumer Group(s)
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
          <Select id="topics" minWidth="320px" selectSize="L" />
        </div>
      </S.CreateLabel>
    </>
  );
};

export default ConsumersACL;
