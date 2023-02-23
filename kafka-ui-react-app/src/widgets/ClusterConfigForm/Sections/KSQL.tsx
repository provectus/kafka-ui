import React from 'react';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import SectionHeader from 'widgets/ClusterConfigForm/SectionHeader';

const KSQL = () => {
  const { setValue, watch } = useFormContext();
  const ksql = watch('ksql');
  const toggleConfig = () => {
    setValue('ksql', ksql ? undefined : { url: '', isAuth: false });
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
          <Checkbox name="ksql.isAuth" label="Is KSQL DB secured with auth?" />
          {ksql.isAuth && (
            <FlexRow>
              <FlexGrow1>
                <Input
                  label="Username *"
                  type="text"
                  name="ksql.username"
                  withError
                />
              </FlexGrow1>
              <FlexGrow1>
                <Input
                  label="Password *"
                  type="password"
                  name="ksql.password"
                  withError
                />
              </FlexGrow1>
            </FlexRow>
          )}
        </>
      )}
    </>
  );
};
export default KSQL;
