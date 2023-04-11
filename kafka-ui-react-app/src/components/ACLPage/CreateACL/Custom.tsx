import React from 'react';
import Select from 'components/common/Select/Select';
import {
  KafkaAclResourceTypeEnum,
  KafkaAclOperationEnum,
} from 'generated-sources';

import * as S from './Create.styled';

const enumValueToReadable = (value: string) => {
  let raw = value;
  if (raw.includes('_')) {
    raw = raw.replaceAll('_', ' ');
  }

  raw = raw.toLowerCase().charAt(0).toUpperCase() + raw.toLowerCase().slice(1);

  return raw;
};

const resourceTypeOptions = Object.keys(KafkaAclResourceTypeEnum).map(
  (option) => {
    return {
      label: enumValueToReadable(option),
      value:
        KafkaAclResourceTypeEnum[
          option as keyof typeof KafkaAclResourceTypeEnum
        ].toLowerCase(),
    };
  }
);

const operationTypeOptions = Object.keys(KafkaAclOperationEnum).map(
  (option) => {
    return {
      label: enumValueToReadable(option),
      value:
        KafkaAclOperationEnum[
          option as keyof typeof KafkaAclOperationEnum
        ].toLowerCase(),
    };
  }
);

const CustomACL: React.FC = () => {
  return (
    <>
      <S.CreateLabel id="resource">
        Resource type
        <Select
          id="resource"
          minWidth="320px"
          selectSize="L"
          placeholder="Select"
          options={resourceTypeOptions}
        />
      </S.CreateLabel>
      <S.CreateLabel id="operations">
        Operations
        <div>
          <S.CreateButtonGroup>
            <S.CreateButton
              buttonType="primary"
              buttonSize="M"
              isPermissions="allow"
            >
              Allow
            </S.CreateButton>
            <S.CreateButton
              buttonType="secondary"
              buttonSize="M"
              isPermissions="deny"
            >
              Deny
            </S.CreateButton>
          </S.CreateButtonGroup>
          <Select
            id="operations"
            minWidth="320px"
            selectSize="L"
            placeholder="Select"
            options={operationTypeOptions}
          />
        </div>
      </S.CreateLabel>
      <S.CreateLabel id="pattern">
        Matching pattern
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
          <S.CreateInput id="pattern" placeholder="Placeholder" />
        </div>
      </S.CreateLabel>
    </>
  );
};

export default CustomACL;
