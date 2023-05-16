import * as React from 'react';
import Input from 'components/common/Input/Input';
import Fileupload from 'widgets/ClusterConfigForm/common/Fileupload';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';

type SSLFormProps = {
  prefix: string;
  title: string;
};

const SSLForm: React.FC<SSLFormProps> = ({ prefix, title }) => {
  return (
    <S.GroupFieldWrapper>
      <Fileupload name={`${prefix}.location`} label={`${title} Location`} />
      <Input
        label={`${title} Password`}
        name={`${prefix}.password`}
        type="password"
        withError
      />
    </S.GroupFieldWrapper>
  );
};

export default SSLForm;
