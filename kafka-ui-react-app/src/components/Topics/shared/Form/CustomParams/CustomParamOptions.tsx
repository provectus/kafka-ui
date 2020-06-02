import React from 'react';
import { TopicCustomParamOption } from 'redux/interfaces';
import CUSTOM_PARAMS_OPTIONS from './customParamsOptions';

const CustomParamOptions = () => (
  <>
    <option value="">Select</option>
    {Object.values(CUSTOM_PARAMS_OPTIONS).map((opt: TopicCustomParamOption) => (
      <option key={opt.name} value={opt.name}>
        {opt.name}
      </option>
    ))}
  </>
);

export default React.memo(CustomParamOptions);
