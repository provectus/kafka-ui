import * as React from 'react';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import ControlledCheckbox from 'components/common/Checkbox/ControlledCheckbox';
import ControlledInput from 'components/common/Input/ControlledInput';
import { useFormContext } from 'react-hook-form';

type CredentialsProps = {
  prefix: string;
  title?: string;
};

const Credentials: React.FC<CredentialsProps> = ({
  prefix,
  title = 'Secured with auth?',
}) => {
  const { watch } = useFormContext();

  return (
    <S.GroupFieldWrapper>
      <ControlledCheckbox name={`${prefix}.isAuth`} label={title} />
      {watch(`${prefix}.isAuth`) && (
        <S.FlexRow>
          <S.FlexGrow1>
            <ControlledInput
              label="Username *"
              type="text"
              name={`${prefix}.username`}
              withError
            />
          </S.FlexGrow1>
          <S.FlexGrow1>
            <ControlledInput
              label="Password *"
              type="password"
              name={`${prefix}.password`}
              withError
            />
          </S.FlexGrow1>
        </S.FlexRow>
      )}
    </S.GroupFieldWrapper>
  );
};

export default Credentials;
