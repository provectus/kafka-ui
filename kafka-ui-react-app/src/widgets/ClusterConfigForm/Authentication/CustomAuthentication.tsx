import React from 'react';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import { Button } from 'components/common/Button/Button';
import {
  FlexGrow1,
  FlexRow,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import Input from 'components/common/Input/Input';
import { convertFormKeyToPropsKey } from 'widgets/ClusterConfigForm/utils/convertFormKeyToPropsKey';

const CustomAuthentication: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const customConf = watch('customAuth');
  const hasCustomConfig =
    customConf && Object.values(customConf).some((v) => !!v);

  const remove = () => setValue('customAuth', undefined);
  return (
    <>
      <FlexRow>
        <FlexGrow1>
          <Heading level={3}>Authentication</Heading>
        </FlexGrow1>
        <Button buttonSize="M" buttonType="primary" onClick={remove}>
          Remove from config
        </Button>
      </FlexRow>
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
