import React from 'react';
import { InputHint } from 'components/common/Input/Input.styled';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';

import * as S from './Create.styled';
import { topicOptions } from './util';

const Producers: React.FC = () => {
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  return (
    <>
      <S.CreateLabel id="pattern">
        To topic(s)
        <div>
          <S.CreateButtonGroup role="group">
            <S.CreateButton
              buttonType="primary"
              buttonSize="M"
              isPattern="exact"
            >
              Exact
            </S.CreateButton>
            <S.CreateButton
              buttonType="secondary"
              buttonSize="M"
              isPattern="prefix"
            >
              Prefixed
            </S.CreateButton>
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
            <S.CreateButton
              buttonType="primary"
              buttonSize="M"
              isPattern="exact"
            >
              Exact
            </S.CreateButton>
            <S.CreateButton
              buttonType="secondary"
              buttonSize="M"
              isPattern="prefix"
            >
              Prefixed
            </S.CreateButton>
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
