import * as React from 'react';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
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
      setValue(name, resp.location, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onReset = () => {
    setValue(name, '', { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div>
      <InputLabel htmlFor={id}>{label}</InputLabel>

      {loc ? (
        <S.FlexRow>
          <S.FlexGrow1>
            <Input name={name} disabled />
          </S.FlexGrow1>
          <Button buttonType="secondary" buttonSize="L" onClick={onReset}>
            Reset
          </Button>
        </S.FlexRow>
      ) : (
        <S.FileUploadInputWrapper>
          {upload.isLoading ? (
            <p>Uploading...</p>
          ) : (
            <input type="file" onChange={handleFileChange} />
          )}
        </S.FileUploadInputWrapper>
      )}
      <FormError>
        <ErrorMessage name={name} />
      </FormError>
    </div>
  );
};

export default Fileupload;
