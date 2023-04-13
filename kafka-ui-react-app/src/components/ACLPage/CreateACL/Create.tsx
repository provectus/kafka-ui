import React from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import Select, { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import CustomACL from 'components/ACLPage/CreateACL/Custom';
import ConsumersACL from 'components/ACLPage/CreateACL/Consumers';
import Producers from 'components/ACLPage/CreateACL/Producers';
import KafkaStream from 'components/ACLPage/CreateACL/KafkaStream';
import { useCreateAcl } from 'lib/hooks/api/acl';
import { ClusterName } from 'redux/interfaces';
import {
  KafkaAcl,
  KafkaAclNamePatternTypeEnum,
  KafkaAclPermissionEnum,
  KafkaAclResourceTypeEnum,
} from 'generated-sources';

import * as S from './Create.styled';

interface CreateACLProps {
  onCancel: () => void;
  clusterName: ClusterName;
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

const Create: React.FC<CreateACLProps> = ({ onCancel, clusterName }) => {
  const [selected, setSelected] = React.useState(ACTypeOption[0].value);
  const methods = useForm<KafkaAcl>({
    defaultValues: {
      namePatternType: KafkaAclNamePatternTypeEnum.LITERAL,
      resourceName: '',
      permission: KafkaAclPermissionEnum.ALLOW,
    },
  });
  const { createResource } = useCreateAcl(clusterName);

  const onSubmit = (acl: KafkaAcl) => {
    const payload = {
      ...acl,
      resourceType: KafkaAclResourceTypeEnum[acl.resourceType],
    };
    createResource(payload);
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
            Principal
            <Controller
              name="principal"
              render={({ field }) => {
                return (
                  <S.CreateInput
                    id="principal"
                    name={field.name}
                    onChange={field.onChange}
                    placeholder="Placeholder"
                  />
                );
              }}
            />
          </S.CreateLabel>
          <S.CreateLabel id="host">
            Host Restrictions
            <Controller
              name="host"
              render={({ field }) => {
                return (
                  <S.CreateInput
                    name={field.name}
                    id="host"
                    onChange={field.onChange}
                    placeholder="Placeholder"
                  />
                );
              }}
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
