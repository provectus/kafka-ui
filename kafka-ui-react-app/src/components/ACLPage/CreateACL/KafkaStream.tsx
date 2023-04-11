import React from 'react';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';

import * as S from './Create.styled';
import { topicOptions } from './util';

const KafkaStream: React.FC = () => {
  const [fromTopics, setFromTopics] = React.useState([]);
  const [toTopics, setToTopics] = React.useState([]);
  return (
    <>
      <S.CreateLabel id="fromTopic">
        From topic(s)
        <MultiSelect
          minWidth="320px"
          height="40px"
          labelledBy="Select topics"
          options={topicOptions}
          value={fromTopics}
          onChange={setFromTopics}
          disableSearch
          hasSelectAll={false}
        />
      </S.CreateLabel>
      <S.CreateLabel id="toTopic">
        To topic(s)
        <MultiSelect
          minWidth="320px"
          height="40px"
          labelledBy="Select topics"
          options={topicOptions}
          value={toTopics}
          onChange={setToTopics}
          disableSearch
          hasSelectAll={false}
        />
      </S.CreateLabel>
      <S.CreateLabel id="pattern">
        Transaction ID
        <S.CreateInput placeholder="Placeholder" />
      </S.CreateLabel>
    </>
  );
};

export default KafkaStream;
