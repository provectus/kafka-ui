import * as React from 'react';
import Input from 'components/common/Input/Input';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import Checkbox from 'components/common/Checkbox/Checkbox';
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
      <Checkbox name={`${prefix}.isAuth`} label={title} />
      {watch(`${prefix}.isAuth`) && (
        <S.FlexRow>
          <S.FlexGrow1>
            <Input
              label="Username *"
              type="text"
              name={`${prefix}.username`}
              withError
            />
          </S.FlexGrow1>
          <S.FlexGrow1>
            <Input
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
