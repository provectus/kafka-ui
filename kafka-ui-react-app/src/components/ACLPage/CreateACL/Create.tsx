import React from 'react';
import Select, { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import CustomACL from 'components/ACLPage/CreateACL/Custom';
import ConsumersACL from 'components/ACLPage/CreateACL/Consumers';
import Producers from 'components/ACLPage/CreateACL/Producers';
import KafkaStream from 'components/ACLPage/CreateACL/KafkaStream';

import * as S from './Create.styled';

const ACTypeOption: SelectOption[] = [
  {
    value: 'custom',
    label: 'Custom',
  },
  {
    value: 'consumers',
    label: 'For Consumers',
  },
  {
    value: 'producers',
    label: 'For Producers',
  },
  {
    value: 'stream',
    label: 'For Kafka stream apps',
  },
];

const Create: React.FC = () => {
  const [selected, setSelected] = React.useState(ACTypeOption[0].value);

  return (
    <S.Wrapper>
      <S.CreateLabel>
        Select ACL type
        <Select
          minWidth="320px"
          selectSize="L"
          options={ACTypeOption}
          value={selected}
          onChange={(option) => setSelected(option)}
        />
      </S.CreateLabel>
      <S.Divider />
      <S.CreateLabel id="principal">
        Principal <S.CreateInput id="principal" placeholder="Placeholder" />
      </S.CreateLabel>
      <S.CreateLabel id="host">
        Host Restrictions <S.CreateInput id="host" placeholder="Placeholder" />
      </S.CreateLabel>
      <S.Divider />
      {selected === 'custom' ? <CustomACL /> : null}
      {selected === 'consumers' ? <ConsumersACL /> : null}
      {selected === 'producers' ? <Producers /> : null}
      {selected === 'stream' ? <KafkaStream /> : null}
      <S.CreateFooter>
        <S.Divider />
        <Button buttonType="secondary" buttonSize="M">
          Cancel
        </Button>
        <Button buttonType="primary" buttonSize="M">
          Create ACL
        </Button>
      </S.CreateFooter>
    </S.Wrapper>
  );
};

export default Create;
