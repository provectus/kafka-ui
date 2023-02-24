import React from 'react';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import { METRICS_OPTIONS } from 'lib/constants';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import SectionHeader from 'widgets/ClusterConfigForm/SectionHeader';

const Metrics = () => {
  const { setValue, watch } = useFormContext();
  const visibleMetrics = !!watch('metrics');
  const toggleMetrics = () =>
    setValue(
      'metrics',
      visibleMetrics
        ? undefined
        : {
            type: '',
            port: 0,
            isAuth: false,
          },
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );

  const isAuth = watch('metrics.isAuth');
  return (
    <>
      <SectionHeader
        title="Metrics"
        adding={!visibleMetrics}
        addButtonText="Configure Metrics"
        onClick={toggleMetrics}
      />
      {visibleMetrics && (
        <>
          <ControlledSelect
            name="metrics.type"
            label="Metrics Type"
            placeholder="Choose metrics type"
            options={METRICS_OPTIONS}
          />
          <Input
            label="Port *"
            name="metrics.port"
            type="number"
            positiveOnly
            withError
          />
          <Checkbox name="metrics.isAuth" label="Secured with auth?" />
          {isAuth && (
            <FlexRow>
              <FlexGrow1>
                <Input
                  label="Username *"
                  name="metrics.username"
                  type="text"
                  withError
                />
              </FlexGrow1>
              <FlexGrow1>
                <Input
                  label="Password *"
                  name="metrics.password"
                  type="password"
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
export default Metrics;
