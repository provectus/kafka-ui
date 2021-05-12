import React from 'react';
import { create } from 'react-test-renderer';
import StatusTag, { StatusTagProps } from 'components/Connect/StatusTag';
import { ConnectorTaskStatus } from 'generated-sources';

describe('StatusTag', () => {
  const setupWrapper = (props: Partial<StatusTagProps> = {}) => (
    <StatusTag status={ConnectorTaskStatus.RUNNING} {...props} />
  );

  it('matches snapshot for running status', () => {
    const wrapper = create(
      setupWrapper({ status: ConnectorTaskStatus.RUNNING })
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for failed status', () => {
    const wrapper = create(
      setupWrapper({ status: ConnectorTaskStatus.FAILED })
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for paused status', () => {
    const wrapper = create(
      setupWrapper({ status: ConnectorTaskStatus.PAUSED })
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for unassigned status', () => {
    const wrapper = create(
      setupWrapper({ status: ConnectorTaskStatus.UNASSIGNED })
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
