import React from 'react';
import { omit, reject, reduce, remove } from 'lodash';

import { TopicFormCustomParams, TopicConfigByName } from 'redux/interfaces';
import CustomParamButton, { CustomParamButtonType } from './CustomParamButton';
import CustomParamField from './CustomParamField';

export const INDEX_PREFIX = 'customParams';

interface Props {
  isSubmitting: boolean;
  config?: TopicConfigByName;
}

interface Param {
  [index: string]: {
    name: string;
    value: string;
  };
}

const existingFields: string[] = [];

const CustomParams: React.FC<Props> = ({ isSubmitting, config }) => {
  const byIndex = config
    ? reduce(
        config.byName,
        (result: Param, param, paramName) => {
          result[`${INDEX_PREFIX}.${new Date().getTime()}ts`] = {
            name: paramName,
            value: param.value,
          };
          return result;
        },
        {}
      )
    : {};

  const [formCustomParams, setFormCustomParams] = React.useState<
    TopicFormCustomParams
  >({
    byIndex,
    allIndexes: Object.keys(byIndex),
  });

  const onAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const newIndex = `${INDEX_PREFIX}.${new Date().getTime()}ts`;

    setFormCustomParams({
      ...formCustomParams,
      byIndex: {
        ...formCustomParams.byIndex,
        [newIndex]: { name: '', value: '' },
      },
      allIndexes: [newIndex, ...formCustomParams.allIndexes],
    });
  };

  const onRemove = (index: string) => {
    const fieldName = formCustomParams.byIndex[index].name;
    remove(existingFields, (el) => el === fieldName);
    setFormCustomParams({
      ...formCustomParams,
      byIndex: omit(formCustomParams.byIndex, index),
      allIndexes: reject(formCustomParams.allIndexes, (i) => i === index),
    });
  };

  const onFieldNameChange = (index: string, name: string) => {
    formCustomParams.byIndex[index].name = name;
    existingFields.push(name);
  };

  return (
    <>
      <div className="columns">
        <div className="column">
          <CustomParamButton
            className="is-success"
            type={CustomParamButtonType.plus}
            onClick={onAdd}
            btnText="Add Custom Parameter"
          />
        </div>
      </div>

      {formCustomParams.allIndexes.map((index) => (
        <CustomParamField
          key={index}
          index={index}
          isDisabled={isSubmitting}
          name={formCustomParams.byIndex[index].name}
          defaultValue={formCustomParams.byIndex[index].value}
          existingFields={existingFields}
          onNameChange={onFieldNameChange}
          onRemove={onRemove}
        />
      ))}
    </>
  );
};

export default CustomParams;
