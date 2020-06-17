import React from 'react';
import { useFormContext, ErrorMessage } from 'react-hook-form';
import { TopicFormCustomParam } from 'redux/interfaces';
import CustomParamSelect from 'components/Topics/shared/Form/CustomParams/CustomParamSelect';
import CustomParamValue from 'components/Topics/shared/Form/CustomParams/CustomParamValue';
import CustomParamAction from 'components/Topics/shared/Form/CustomParams/CustomParamAction';
import { INDEX_PREFIX } from './CustomParams';
import CustomParamOptions from './CustomParamOptions';

interface Props {
  isDisabled: boolean;
  index: string;
  name: string;
  existingFields: string[];
  defaultValue: string;
  onNameChange: (inputName: string, name: string) => void;
  onRemove: (index: string) => void;
}

const CustomParamField: React.FC<Props> = ({
  isDisabled,
  index,
  name,
  existingFields,
  defaultValue,
  onNameChange,
  onRemove,
}) => {
  return (
    <div className="columns is-centered">
      <div className="column">
        <CustomParamSelect
          index={index}
          isDisabled={isDisabled}
          name={name}
          existingFields={existingFields}
          onNameChange={onNameChange}
        />
      </div>

      <div className="column">
        <CustomParamValue
          index={index}
          isDisabled={isDisabled}
          name={name}
          defaultValue={defaultValue}
        />
      </div>

      <div className="column is-narrow">
        <CustomParamAction index={index} onRemove={onRemove} />
      </div>
    </div>
  );
};

export default React.memo(CustomParamField);
