import React from 'react';
import { omit, reject } from 'lodash';

import { TopicFormCustomParams } from 'redux/interfaces';
import CustomParamSelect from './CustomParamSelect';
import CustomParamValue from './CustomParamValue';
import CustomParamAction from './CustomParamAction';

const DEF_INDEX = 'default';
export const INDEX_PREFIX = 'customParams';
export const isFirstParam = (index: string) => (index === DEF_INDEX);

interface Props {
  isSubmitting: boolean;
}

const CustomParams: React.FC<Props> = ({
  isSubmitting,
}) => {

  const [formCustomParams, setFormCustomParams] = React.useState<TopicFormCustomParams>({
    byIndex: { [DEF_INDEX]: { name: '', value: '' } },
    allIndexes: [DEF_INDEX],
  });

  const onAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const newIndex = `${INDEX_PREFIX}.${new Date().getTime()}`;

    setFormCustomParams({
      ...formCustomParams,
      byIndex: {
        ...formCustomParams.byIndex,
        [newIndex]: { name: '', value: '' },
      },
      allIndexes: [
        formCustomParams.allIndexes[0],
        newIndex,
        ...formCustomParams.allIndexes.slice(1),
      ],
    });
  }

  const onRemove = (index: string) => {
    setFormCustomParams({
      ...formCustomParams,
      byIndex: omit(formCustomParams.byIndex, index),
      allIndexes: reject(formCustomParams.allIndexes, (i) => (i === index)),
    });
  }

  return (
    <>
      {
        formCustomParams.allIndexes.map((index) => (
          <div className="columns is-centered" key={index}>
            <div className="column">
              <CustomParamSelect
                index={index}
                isDisabled={isFirstParam(index) || isSubmitting}
                name={formCustomParams.byIndex[index].name}
              />
            </div>

            <div className="column">
              <CustomParamValue
                index={index}
                isDisabled={isFirstParam(index) || isSubmitting}
                name={formCustomParams.byIndex[index].name}
                defaultValue={formCustomParams.byIndex[index].value}
              />
            </div>

            <div className="column is-narrow">
              <CustomParamAction
                index={index}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            </div>
          </div>
        ))
      }
    </>
  );
};

export default CustomParams;
