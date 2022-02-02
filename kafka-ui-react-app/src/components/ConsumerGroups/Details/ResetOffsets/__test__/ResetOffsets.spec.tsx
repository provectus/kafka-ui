import React from 'react';
import fetchMock from 'fetch-mock';
import { Route } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { clusterConsumerGroupResetOffsetsPath } from 'lib/paths';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';

const clusterName = 'cluster1';
const { groupId } = consumerGroupPayload;

const renderComponent = () =>
  render(
    <Route
      path={clusterConsumerGroupResetOffsetsPath(
        ':clusterName',
        ':consumerGroupID'
      )}
    >
      <ResetOffsets />
    </Route>,
    {
      pathname: clusterConsumerGroupResetOffsetsPath(
        clusterName,
        consumerGroupPayload.groupId
      ),
    }
  );

const resetConsumerGroupOffsetsMockCalled = () =>
  expect(
    fetchMock.called(
      `/api/clusters/${clusterName}/consumer-groups/${groupId}/offsets`
    )
  ).toBeTruthy();

const selectresetTypeAndPartitions = async (resetType: string) => {
  userEvent.click(screen.getByLabelText('Reset Type'));
  userEvent.click(screen.getByText(resetType));
  userEvent.click(screen.getByText('Select...'));
  await waitFor(() => {
    userEvent.click(screen.getByText('Partition #0'));
  });
};

const resetConsumerGroupOffsetsWith = async (
  resetType: string,
  offset: null | number = null
) => {
  userEvent.click(screen.getByLabelText('Reset Type'));
  const options = screen.getAllByText(resetType);
  userEvent.click(options.length > 1 ? options[1] : options[0]);
  userEvent.click(screen.getByText('Select...'));
  await waitFor(() => {
    userEvent.click(screen.getByText('Partition #0'));
  });
  fetchMock.postOnce(
    `/api/clusters/${clusterName}/consumer-groups/${groupId}/offsets`,
    200,
    {
      body: {
        topic: '__amazon_msk_canary',
        resetType,
        partitions: [0],
        partitionsOffsets: [{ partition: 0, offset }],
      },
    }
  );
  userEvent.click(screen.getByText('Submit'));
  await waitFor(() => resetConsumerGroupOffsetsMockCalled());
};

describe('ResetOffsets', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('renders progress bar for initial state', () => {
    fetchMock.getOnce(
      `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
      404
    );
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  describe('with consumer group', () => {
    describe('submit handles resetConsumerGroupOffsets', () => {
      beforeEach(async () => {
        const fetchConsumerGroupMock = fetchMock.getOnce(
          `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
          consumerGroupPayload
        );
        renderComponent();
        await waitFor(() =>
          expect(fetchConsumerGroupMock.called()).toBeTruthy()
        );
        await waitFor(() => screen.queryByRole('form'));
      });

      it('calls resetConsumerGroupOffsets with EARLIEST', async () => {
        await resetConsumerGroupOffsetsWith('EARLIEST');
      });

      it('calls resetConsumerGroupOffsets with LATEST', async () => {
        await resetConsumerGroupOffsetsWith('LATEST');
      });
      it('calls resetConsumerGroupOffsets with OFFSET', async () => {
        await selectresetTypeAndPartitions('OFFSET');
        fetchMock.postOnce(
          `/api/clusters/${clusterName}/consumer-groups/${groupId}/offsets`,
          200,
          {
            body: {
              topic: '__amazon_msk_canary',
              resetType: 'OFFSET',
              partitions: [0],
              partitionsOffsets: [{ partition: 0, offset: 10 }],
            },
          }
        );
        await waitFor(() => {
          userEvent.click(screen.getAllByLabelText('Partition #0')[1]);
        });
        await waitFor(() => {
          userEvent.keyboard('10');
        });
        userEvent.click(screen.getByText('Submit'));
        await waitFor(() => resetConsumerGroupOffsetsMockCalled());
      });
      it('calls resetConsumerGroupOffsets with TIMESTAMP', async () => {
        await selectresetTypeAndPartitions('TIMESTAMP');
        const resetConsumerGroupOffsetsMock = fetchMock.postOnce(
          `/api/clusters/${clusterName}/consumer-groups/${groupId}/offsets`,
          200,
          {
            body: {
              topic: '__amazon_msk_canary',
              resetType: 'OFFSET',
              partitions: [0],
              partitionsOffsets: [{ partition: 0, offset: 10 }],
            },
          }
        );
        userEvent.click(screen.getByText('Submit'));
        await waitFor(() =>
          expect(
            screen.getByText("This field shouldn't be empty!")
          ).toBeInTheDocument()
        );

        await waitFor(() =>
          expect(
            resetConsumerGroupOffsetsMock.called(
              `/api/clusters/${clusterName}/consumer-groups/${groupId}/offsets`
            )
          ).toBeFalsy()
        );
      });
    });
  });
});
