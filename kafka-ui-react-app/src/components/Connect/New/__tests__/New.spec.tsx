import React from 'react';
import { create, act as rendererAct } from 'react-test-renderer';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { containerRendersView, TestRouterWrapper } from 'lib/testHelpers';
import {
  clusterConnectConnectorPath,
  clusterConnectorNewPath,
} from 'lib/paths';
import NewContainer from 'components/Connect/New/NewContainer';
import New, { NewProps } from 'components/Connect/New/New';
import { connects, connector } from 'redux/reducers/connect/__test__/fixtures';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

jest.mock('components/common/JSONEditor/JSONEditor', () => 'mock-JSONEditor');

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('New', () => {
  containerRendersView(<NewContainer />, New);

  describe('view', () => {
    const pathname = clusterConnectorNewPath(':clusterName');
    const clusterName = 'my-cluster';
    const simulateFormSubmit = (wrapper: ReactWrapper) =>
      act(async () => {
        const nameInput = wrapper
          .find('input[name="name"]')
          .getDOMNode<HTMLInputElement>();
        nameInput.value = 'my-connector';
        wrapper
          .find('mock-JSONEditor')
          .simulate('change', { target: { value: '{"class":"MyClass"}' } });
        wrapper.find('input[type="submit"]').simulate('submit');
      });

    const setupWrapper = (props: Partial<NewProps> = {}) => (
      <TestRouterWrapper pathname={pathname} urlParams={{ clusterName }}>
        <New
          fetchConnects={jest.fn()}
          areConnectsFetching={false}
          connects={connects}
          createConnector={jest.fn()}
          {...props}
        />
      </TestRouterWrapper>
    );

    it('matches snapshot', async () => {
      let wrapper = create(<div />);
      await rendererAct(async () => {
        wrapper = create(setupWrapper());
      });
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when fetching connects', async () => {
      let wrapper = create(<div />);
      await rendererAct(async () => {
        wrapper = create(setupWrapper({ areConnectsFetching: true }));
      });
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('fetches connects on mount', async () => {
      const fetchConnects = jest.fn();
      await act(async () => {
        mount(setupWrapper({ fetchConnects }));
      });
      expect(fetchConnects).toHaveBeenCalledTimes(1);
      expect(fetchConnects).toHaveBeenCalledWith(clusterName);
    });

    it('calls createConnector on form submit', async () => {
      const createConnector = jest.fn();
      const wrapper = mount(setupWrapper({ createConnector }));
      await simulateFormSubmit(wrapper);
      expect(createConnector).toHaveBeenCalledTimes(1);
      expect(createConnector).toHaveBeenCalledWith(
        clusterName,
        connects[0].name,
        {
          name: 'my-connector',
          config: { class: 'MyClass' },
        }
      );
    });

    it('redirects to connector details view on successful submit', async () => {
      const createConnector = jest.fn().mockResolvedValue(connector);
      const wrapper = mount(setupWrapper({ createConnector }));
      await simulateFormSubmit(wrapper);
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectConnectorPath(
          clusterName,
          connects[0].name,
          connector.name
        )
      );
    });

    it('does not redirect to connector details view on unsuccessful submit', async () => {
      const createConnector = jest.fn().mockResolvedValueOnce(undefined);
      const wrapper = mount(setupWrapper({ createConnector }));
      await simulateFormSubmit(wrapper);
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });
});
