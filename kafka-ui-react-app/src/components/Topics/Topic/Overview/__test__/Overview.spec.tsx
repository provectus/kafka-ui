import React from 'react';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Overview from 'components/Topics/Topic/Overview/Overview';
import theme from 'theme/theme';
import { CleanUpPolicy, Topic } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { clusterTopicPath } from 'lib/paths';
import { Replica } from 'components/Topics/Topic/Overview/Overview.styled';
import { useTopicDetails } from 'lib/hooks/api/topics';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'lib/fixtures/topics';

const clusterName = 'local';
const topicName = 'topic';
const defaultContextValues = {
  isReadOnly: false,
  hasKafkaConnectConfigured: true,
  hasSchemaRegistryConfigured: true,
  isTopicDeletionAllowed: true,
};

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
}));

const uwrapMock = jest.fn();
const useDispatchMock = () => jest.fn(() => ({ unwrap: uwrapMock }));

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: useDispatchMock,
}));

describe('Overview', () => {
  const renderComponent = (
    topic: Topic = externalTopicPayload,
    context = defaultContextValues
  ) => {
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: topic,
    }));
    const path = clusterTopicPath(clusterName, topicName);
    return render(
      <WithRoute path={clusterTopicPath()}>
        <ClusterContext.Provider value={context}>
          <Overview />
        </ClusterContext.Provider>
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  it('at least one replica was rendered', () => {
    renderComponent();
    expect(screen.getByLabelText('replica-info')).toBeInTheDocument();
  });

  it('renders replica cell with props', () => {
    render(<Replica leader />);
    const element = screen.getByLabelText('replica-info');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyleRule(
      'color',
      theme.topicMetaData.liderReplica.color
    );
  });

  describe('when it has internal flag', () => {
    it('renders the Action button for Topic', () => {
      renderComponent({
        ...externalTopicPayload,
        cleanUpPolicy: CleanUpPolicy.DELETE,
      });
      expect(screen.getAllByLabelText('Dropdown Toggle').length).toEqual(1);
    });

    it('does not render Partitions', () => {
      renderComponent({ ...externalTopicPayload, partitions: [] });
      expect(screen.getByText('No Partitions found')).toBeInTheDocument();
    });
  });

  describe('should render circular alert', () => {
    it('should be in document', () => {
      renderComponent();
      const circles = screen.getAllByRole('circle');
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      renderComponent({
        ...externalTopicPayload,
        underReplicatedPartitions: 0,
        inSyncReplicas: 1,
        replicas: 2,
      });
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toHaveStyle(
        `fill: ${theme.circularAlert.color.success}`
      );
      expect(circles[1]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });
  });

  describe('when Clear Messages is clicked', () => {
    it('should when Clear Messages is clicked', async () => {
      renderComponent({
        ...externalTopicPayload,
        cleanUpPolicy: CleanUpPolicy.DELETE,
      });

      const clearMessagesButton = screen.getByText('Clear Messages');
      await userEvent.click(clearMessagesButton);
      expect(uwrapMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the table partition dropdown appearance', () => {
    it('should check if the dropdown is disabled when it is readOnly', () => {
      renderComponent(
        {
          ...externalTopicPayload,
        },
        { ...defaultContextValues, isReadOnly: true }
      );
      expect(screen.getByLabelText('Dropdown Toggle')).toBeDisabled();
    });

    it('should check if the dropdown is disabled when it is internal', () => {
      renderComponent({
        ...internalTopicPayload,
      });
      expect(screen.getByLabelText('Dropdown Toggle')).toBeDisabled();
    });

    it('should check if the dropdown is disabled when cleanUpPolicy is not DELETE', () => {
      renderComponent({
        ...externalTopicPayload,
        cleanUpPolicy: CleanUpPolicy.COMPACT,
      });
      expect(screen.getByLabelText('Dropdown Toggle')).toBeDisabled();
    });
  });
});
