import React from 'react';
import { create } from 'react-test-renderer';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { containerRendersView, TestRouterWrapper } from 'lib/testHelpers';
import { clusterConnectConnectorTasksPath } from 'lib/paths';
import ListItemContainer from 'components/Connect/Details/Tasks/ListItem/ListItemContainer';
import ListItem, {
  ListItemProps,
} from 'components/Connect/Details/Tasks/ListItem/ListItem';
import { tasks } from 'redux/reducers/connect/__test__/fixtures';

jest.mock('components/Connect/StatusTag', () => 'mock-StatusTag');

describe('ListItem', () => {
  containerRendersView(
    <table>
      <tbody>
        <ListItemContainer task={tasks[0]} />
      </tbody>
    </table>,
    ListItem
  );

  describe('view', () => {
    const pathname = clusterConnectConnectorTasksPath(
      ':clusterName',
      ':connectName',
      ':connectorName'
    );
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const setupWrapper = (props: Partial<ListItemProps> = {}) => (
      <TestRouterWrapper
        pathname={pathname}
        urlParams={{ clusterName, connectName, connectorName }}
      >
        <table>
          <tbody>
            <ListItem task={tasks[0]} restartTask={jest.fn()} {...props} />
          </tbody>
        </table>
      </TestRouterWrapper>
    );

    it('matches snapshot', () => {
      const wrapper = create(setupWrapper());
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('calls restartTask on button click', async () => {
      const restartTask = jest.fn();
      const wrapper = mount(setupWrapper({ restartTask }));
      await act(async () => {
        wrapper.find('button').simulate('click');
      });
      expect(restartTask).toHaveBeenCalledTimes(1);
      expect(restartTask).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName,
        tasks[0].id?.task
      );
    });
  });
});
