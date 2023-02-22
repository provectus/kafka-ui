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
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import { useAppConfigFilesUpload } from 'lib/hooks/api/appConfig';

const Fileupload: React.FC<{ name: string; label: string }> = ({
  name,
  label,
}) => {
  const upload = useAppConfigFilesUpload();

  const id = React.useId();
  const { watch, setValue } = useFormContext();
  const loc = watch(name);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const formData = new FormData();
      const file = e.target.files[0];
      formData.append('file', file);
      const resp = await upload.mutateAsync(formData);
      setValue(name, resp.location);
    }
  };

  const onReset = () => {
    setValue(name, '');
  };

  return (
    <div>
      <InputLabel htmlFor={id}>{label}</InputLabel>

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
        <div>
          {upload.isLoading ? (
            <p>Uploading...</p>
          ) : (
            <input type="file" onChange={handleFileChange} />
          )}
        </div>
      )}
      <FormError>
        <ErrorMessage name={name} />
      </FormError>
    </div>
  );
};

export default Fileupload;
