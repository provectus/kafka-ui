import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import { convertFormKeyToPropsKey } from 'widgets/ClusterConfigForm/utils/convertFormKeyToPropsKey';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';

const CustomAuthentication: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const customConf = watch('customAuth');
  const hasCustomConfig =
    customConf && Object.values(customConf).some((v) => !!v);

  const remove = () =>
    setValue('customAuth', undefined, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  return (
    <>
      <SectionHeader
        title="Authentication"
        addButtonText="Configure Authentication"
        onClick={remove}
      />
      {hasCustomConfig && (
        <>
          {Object.keys(customConf).map((key) => (
            <Input
              key={key}
              type="text"
              name={`customAuth.${key}`}
              label={convertFormKeyToPropsKey(key)}
              withError
            />
          ))}
        </>
      )}
    </>
  );
};

export default CustomAuthentication;
