import React from 'react';
import { TopicConfigOption } from 'redux/interfaces';
import { omitBy } from 'lodash';
import CUSTOM_PARAMS_OPTIONS from './customParamsOptions';

interface Props {
  existingFields: string[];
}

const CustomParamOptions: React.FC<Props> = ({ existingFields }) => {
  const fields = omitBy(Object.values(CUSTOM_PARAMS_OPTIONS), (field) =>
    existingFields.includes(field.name)
  );

  return (
    <>
      <option value="">Select</option>
      {Object.values(fields).map((opt: TopicConfigOption) => (
        <option key={opt.name} value={opt.name}>
          {opt.name}
        </option>
      ))}
    </>
  );
};

export default React.memo(CustomParamOptions);
