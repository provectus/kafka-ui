import React from 'react';
import { CUSTOM_PARAMS_OPTIONS } from './customParamsOptions';

const CustomParamOptions: React.FC<{}> = () => (
  <>
    <option value=''>Select</option>
    {
      Object.keys(CUSTOM_PARAMS_OPTIONS).map((key: string) => (
        <option key={key} value={key}>
          {CUSTOM_PARAMS_OPTIONS[key].optName}
        </option>
      ))
    }
  </>
);

export default React.memo(CustomParamOptions);
