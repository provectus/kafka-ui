import React from 'react';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import Select from 'components/common/Select/Select';

import * as S from './Create.styled';
import { topicOptions } from './util';

const ConsumersACL: React.FC = () => {
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  return (
    <>
      <S.CreateLabel id="pattern">
        From topic(s)
        <div>
          {/* <S.CreateButtonGroup>
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
          </S.CreateButtonGroup> */}
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
          <S.CreateButtonGroup>
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
          <Select id="topics" minWidth="320px" selectSize="L" />
        </div>
      </S.CreateLabel>
    </>
  );
};

export default ConsumersACL;
