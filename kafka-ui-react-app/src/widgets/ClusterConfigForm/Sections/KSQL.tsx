import React from 'react';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';
import SSLForm from 'widgets/ClusterConfigForm/common/SSLForm';
import Credentials from 'widgets/ClusterConfigForm/common/Credentials';

const KSQL = () => {
  const { setValue, watch } = useFormContext();
  const ksql = watch('ksql');
  const toggleConfig = () => {
    setValue('ksql', ksql ? undefined : { url: '', isAuth: false }, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };
  return (
    <>
      <SectionHeader
        title="KSQL DB"
        adding={!ksql}
        addButtonText="Configure KSQL DB"
        onClick={toggleConfig}
      />
      {ksql && (
        <>
          <Input
            label="URL *"
            name="ksql.url"
            type="text"
            placeholder="http://localhost:8088"
            withError
          />
          <Credentials prefix="ksql" title="Is KSQL DB secured with auth?" />
          <SSLForm prefix="ksql.keystore" title="KSQL DB Keystore" />
        </>
      )}
    </>
  );
};
export default KSQL;
