import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Select, { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import CustomACL from 'components/ACLPage/CreateACL/Custom';
import ConsumersACL from 'components/ACLPage/CreateACL/Consumers';
import Producers from 'components/ACLPage/CreateACL/Producers';
import KafkaStream from 'components/ACLPage/CreateACL/KafkaStream';
import { KafkaAcl } from 'generated-sources';

import * as S from './Create.styled';

interface CreateACLProps {
  onCancel: () => void;
}

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

const Create: React.FC<CreateACLProps> = ({ onCancel }) => {
  const [selected, setSelected] = React.useState(ACTypeOption[0].value);
  const methods = useForm<KafkaAcl>();

  const onSubmit = (args: KafkaAcl) => {
    console.log(args);
  };

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
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <S.CreateLabel id="principal">
            Principal{' '}
            <S.CreateInput
              id="principal"
              placeholder="Placeholder"
              {...methods.register('principal')}
            />
          </S.CreateLabel>
          <S.CreateLabel id="host">
            Host Restrictions
            <S.CreateInput
              id="host"
              placeholder="Placeholder"
              {...methods.register('host')}
            />
          </S.CreateLabel>
          <S.Divider />
          {selected === 'custom' ? <CustomACL /> : null}
          {selected === 'consumers' ? <ConsumersACL /> : null}
          {selected === 'producers' ? <Producers /> : null}
          {selected === 'stream' ? <KafkaStream /> : null}
          <S.CreateFooter>
            <S.Divider />
            <Button buttonType="secondary" buttonSize="M" onClick={onCancel}>
              Cancel
            </Button>
            <Button buttonType="primary" buttonSize="M" type="submit">
              Create ACL
            </Button>
          </S.CreateFooter>
        </form>
      </FormProvider>
    </S.Wrapper>
  );
};

export default Create;
