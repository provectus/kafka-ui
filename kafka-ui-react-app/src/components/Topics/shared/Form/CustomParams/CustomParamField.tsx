import React from 'react';
import CustomParamSelect from 'components/Topics/shared/Form/CustomParams/CustomParamSelect';
import CustomParamValue from 'components/Topics/shared/Form/CustomParams/CustomParamValue';
import CustomParamAction from 'components/Topics/shared/Form/CustomParams/CustomParamAction';
import { TopicConfig } from 'generated-sources';

interface Props {
  isDisabled: boolean;
  index: string;
  name: TopicConfig['name'];
  existingFields: string[];
  defaultValue: TopicConfig['defaultValue'];
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
