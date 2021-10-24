import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import ClusterContext, {
  ContextProps,
} from 'components/contexts/ClusterContext';
import Details, { DetailsProps } from 'components/Topics/Topic/Details/Details';
import {
  internalTopicPayload,
  externalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import { Provider } from 'react-redux';
import configureStore from 'redux/store/configureStore';

const store = configureStore();

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockInternalTopicPayload = internalTopicPayload.internal;
  const mockExternalTopicPayload = externalTopicPayload.internal;

  const setupWrapper = (
    contextProps: Partial<ContextProps> = {},
    detailsProps: Partial<DetailsProps> = {}
  ) => (
    <Provider store={store}>
      <StaticRouter>
        <ClusterContext.Provider
          value={{
            isReadOnly: true,
            hasKafkaConnectConfigured: true,
            hasSchemaRegistryConfigured: true,
            isTopicDeletionAllowed: true,
            ...contextProps,
          }}
        >
          <Details
            clusterName={mockClusterName}
            topicName={internalTopicPayload.name}
            name={internalTopicPayload.name}
            isInternal={mockInternalTopicPayload}
            deleteTopic={mockDelete}
            clearTopicMessages={mockClearTopicMessages}
            isDeleted={false}
            isDeletePolicy
            {...detailsProps}
          />
        </ClusterContext.Provider>
      </StaticRouter>
    </Provider>
  );

  describe('when it has readonly flag', () => {
    const component = mount(setupWrapper({ isReadOnly: true }));
    it('does not render the Action button a Topic', () => {
      expect(component.exists('button')).toBeFalsy();
    });
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe('when it does not have readonly flag', () => {
    const component = mount(
      setupWrapper(
        { isReadOnly: false },
        { isInternal: mockExternalTopicPayload }
      )
    );
    it('renders the Action buttons on a Topic', () => {
      expect(component.exists('button')).toBeTruthy();
      expect(component.find('button').length).toEqual(2);
    });
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe('when it shows on compact topic page', () => {
    const component = mount(
      setupWrapper(
        { isReadOnly: false },
        { isInternal: mockExternalTopicPayload, isDeletePolicy: false }
      )
    );
    it('not render clear message button on a topic', () => {
      expect(component.find('button').length).toEqual(1);
    });
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });
});
