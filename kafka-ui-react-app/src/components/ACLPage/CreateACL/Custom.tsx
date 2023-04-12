import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'components/common/Select/Select';
import {
  KafkaAclResourceTypeEnum,
  KafkaAclOperationEnum,
  KafkaAclPermissionEnum,
  KafkaAclNamePatternTypeEnum,
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
        ],
    };
  }
);

const operationTypeOptions = Object.keys(KafkaAclOperationEnum).map(
  (option) => {
    return {
      label: enumValueToReadable(option),
      value:
        KafkaAclOperationEnum[option as keyof typeof KafkaAclOperationEnum],
    };
  }
);

const CustomACL: React.FC = () => {
  const { watch } = useFormContext();
  return (
    <>
      <S.CreateLabel id="resource">
        Resource type
        <Controller
          name="resourceType"
          render={({ field }) => {
            return (
              <Select
                id="resourceType"
                minWidth="320px"
                selectSize="L"
                placeholder="Select"
                options={resourceTypeOptions}
                {...field}
              />
            );
          }}
        />
      </S.CreateLabel>
      <S.CreateLabel id="operations">
        Operations
        <div>
          <S.CreateButtonGroup>
            <S.CreateCheckboxLabeled
              isPermissions="allow"
              active={watch('permission') === KafkaAclPermissionEnum.ALLOW}
            >
              <Controller
                name="permission"
                render={({ field: { onChange } }) => (
                  <S.CreateButton
                    type="radio"
                    value={KafkaAclPermissionEnum.ALLOW}
                    checked={
                      watch('permission') === KafkaAclPermissionEnum.ALLOW
                    }
                    onChange={onChange}
                  />
                )}
              />
              Allow
            </S.CreateCheckboxLabeled>
            <S.CreateCheckboxLabeled
              isPermissions="deny"
              active={watch('permission') === KafkaAclPermissionEnum.DENY}
            >
              <Controller
                name="permission"
                render={({ field: { onChange } }) => (
                  <S.CreateButton
                    type="radio"
                    value={KafkaAclPermissionEnum.DENY}
                    checked={
                      watch('permission') === KafkaAclPermissionEnum.DENY
                    }
                    onChange={onChange}
                  />
                )}
              />
              Deny
            </S.CreateCheckboxLabeled>
          </S.CreateButtonGroup>
          <Controller
            name="operation"
            render={({ field }) => {
              return (
                <Select
                  id="operation"
                  minWidth="320px"
                  selectSize="L"
                  placeholder="Select"
                  options={operationTypeOptions}
                  {...field}
                />
              );
            }}
          />
        </div>
      </S.CreateLabel>
      <S.CreateLabel id="pattern">
        Matching pattern
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
          <Controller
            name="pattern"
            render={({ field }) => {
              return (
                <S.CreateInput
                  name={field.name}
                  id="pattern"
                  placeholder="Placeholder"
                  onChange={field.onChange}
                />
              );
            }}
          />
        </div>
      </S.CreateLabel>
    </>
  );
};

export default CustomACL;
