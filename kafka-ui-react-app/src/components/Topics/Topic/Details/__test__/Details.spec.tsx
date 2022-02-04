import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import { internalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { Provider } from 'react-redux';
import { store } from 'redux/store';
import { ThemeProvider } from 'styled-components';
import { render } from 'lib/testHelpers';
import { clusterTopicPath } from 'lib/paths';
import theme from 'theme/theme';

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockInternalTopicPayload = internalTopicPayload.internal;

  const setupComponent = (pathname: string) =>
    render(
      <ClusterContext.Provider
        value={{
          isReadOnly: false,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <Details
          clusterName={mockClusterName}
          topicName={internalTopicPayload.name}
          name={internalTopicPayload.name}
          isInternal={false}
          deleteTopic={mockDelete}
          clearTopicMessages={mockClearTopicMessages}
          isDeleted={false}
          isDeletePolicy
        />
      </ClusterContext.Provider>,
      { pathname }
    );

  describe('when it has readonly flag', () => {
    it('does not render the Action button a Topic', () => {
      const component = mount(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <StaticRouter>
              <ClusterContext.Provider
                value={{
                  isReadOnly: true,
                  hasKafkaConnectConfigured: true,
                  hasSchemaRegistryConfigured: true,
                  isTopicDeletionAllowed: true,
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
                />
              </ClusterContext.Provider>
            </StaticRouter>
          </Provider>
        </ThemeProvider>
      );

      expect(component.exists('button')).toBeFalsy();
      expect(component).toMatchSnapshot();
    });
  });

  it('shows a confirmation popup on deleting topic messages', () => {
    setupComponent(
      clusterTopicPath(mockClusterName, internalTopicPayload.name)
    );
    const { getByText } = screen;
    const clearMessagesButton = getByText(/Clear messages/i);
    userEvent.click(clearMessagesButton);

    expect(
      getByText(/Are you sure want to clear topic messages?/i)
    ).toBeInTheDocument();
  });
});
