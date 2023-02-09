import * as React from 'react';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';
import { useAppConfigFilesUpload } from 'lib/hooks/api/appConfig';

const TruststoreFileupload: React.FC = () => {
  const upload = useAppConfigFilesUpload();

  const id = React.useId();
  const { watch, setValue } = useFormContext();
  const name = 'truststore.location';
  const loc = watch(name);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const formData = new FormData();
      const file = e.target.files[0];
      formData.append('file', file);
      await upload.mutateAsync(formData);
    }
  };

  const onReset = () => {
    setValue(name, '');
  };

  return (
    <div>
      <InputLabel htmlFor={id}>Truststore Location</InputLabel>
      {loc ? (
        <FlexRow>
          <FlexGrow1>
            <Input name={name} disabled />
          </FlexGrow1>
          <Button buttonType="secondary" buttonSize="L" onClick={onReset}>
            Reset
          </Button>
        </FlexRow>
      ) : (
        <p>
          <input type="file" onChange={handleFileChange} />
        </p>
      )}
      <FormError>
        <ErrorMessage name={name} />
      </FormError>
    </div>
  );
};

export default TruststoreFileupload;
