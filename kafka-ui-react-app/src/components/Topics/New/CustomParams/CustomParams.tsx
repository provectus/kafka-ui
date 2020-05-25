import React from 'react';
import { omit, reject } from 'lodash';

import { TopicFormCustomParams } from 'redux/interfaces';
import CustomParamSelect from './CustomParamSelect';
import CustomParamValue from './CustomParamValue';
import CustomParamAction from './CustomParamAction';
import CustomParamButton, { CustomParamButtonType } from './CustomParamButton';

export const INDEX_PREFIX = 'customParams';

interface Props {
  isSubmitting: boolean;
}

const CustomParams: React.FC<Props> = ({ isSubmitting }) => {
  const [formCustomParams, setFormCustomParams] = React.useState<
    TopicFormCustomParams
  >({
    byIndex: {},
    allIndexes: [],
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
    setFormCustomParams({
      ...formCustomParams,
      byIndex: omit(formCustomParams.byIndex, index),
      allIndexes: reject(formCustomParams.allIndexes, (i) => i === index),
    });
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
        <div className="columns is-centered" key={index}>
          <div className="column">
            <CustomParamSelect
              index={index}
              isDisabled={isSubmitting}
              name={formCustomParams.byIndex[index].name}
            />
          </div>

          <div className="column">
            <CustomParamValue
              index={index}
              isDisabled={isSubmitting}
              name={formCustomParams.byIndex[index].name}
              defaultValue={formCustomParams.byIndex[index].value}
            />
          </div>

          <div className="column is-narrow">
            <CustomParamAction index={index} onRemove={onRemove} />
          </div>
        </div>
      ))}
    </>
  );
};

export default CustomParams;
