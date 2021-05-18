import React from 'react';
import { create } from 'react-test-renderer';
import { mount } from 'enzyme';
import { containerRendersView } from 'lib/testHelpers';
import OverviewContainer from 'components/Connect/Details/Overview/OverviewContainer';
import Overview, {
  OverviewProps,
} from 'components/Connect/Details/Overview/Overview';
import { connector } from 'redux/reducers/connect/__test__/fixtures';

jest.mock('components/Connect/StatusTag', () => 'mock-StatusTag');

describe('Overview', () => {
  containerRendersView(<OverviewContainer />, Overview);

  describe('view', () => {
    const setupWrapper = (props: Partial<OverviewProps> = {}) => (
      <Overview
        connector={connector}
        runningTasksCount={10}
        failedTasksCount={2}
        {...props}
      />
    );

    it('matches snapshot', () => {
      const wrapper = create(setupWrapper());
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('is empty when no connector', () => {
      const wrapper = mount(setupWrapper({ connector: null }));
      expect(wrapper.html()).toBeNull();
    });
  });
});
