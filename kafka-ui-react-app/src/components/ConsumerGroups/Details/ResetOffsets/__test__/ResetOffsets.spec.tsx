import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResetOffsets, {
  Props,
} from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { ConsumerGroupState } from 'generated-sources';
import React from 'react';
import { StaticRouter } from 'react-router';

import { expectedOutputs } from './fixtures';

const setupWrapper = (props?: Partial<Props>) => (
  <StaticRouter>
    <ResetOffsets
      clusterName="testCluster"
      consumerGroupID="testGroup"
      consumerGroup={{
        groupId: 'amazon.msk.canary.group.broker-1',
        members: 0,
        topics: 2,
        simple: false,
        partitionAssignor: '',
        state: ConsumerGroupState.EMPTY,
        coordinator: {
          id: 2,
          host: 'b-2.kad-msk.st2jzq.c6.kafka.eu-west-1.amazonaws.com',
        },
        messagesBehind: 0,
        partitions: [
          {
            topic: '__amazon_msk_canary',
            partition: 1,
            currentOffset: 0,
            endOffset: 0,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: '__amazon_msk_canary',
            partition: 0,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: 'other_topic',
            partition: 3,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: 'other_topic',
            partition: 4,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
        ],
      }}
      detailsAreFetched
      IsOffsetReset={false}
      fetchConsumerGroupDetails={jest.fn()}
      resetConsumerGroupOffsets={jest.fn()}
      {...props}
    />
  </StaticRouter>
);

const selectresetTypeAndPartitions = async (resetType: string) => {
  fireEvent.change(screen.getByLabelText('Reset Type'), {
    target: { value: resetType },
  });
  await waitFor(() => {
    fireEvent.click(screen.getByText('Select...'));
  });
  await waitFor(() => {
    fireEvent.click(screen.getByText('Partition #0'));
  });
};

describe('ResetOffsets', () => {
  describe('on initial render', () => {
    const component = render(setupWrapper());
    it('matches the snapshot', () => {
      expect(component.baseElement).toMatchSnapshot();
    });
  });

  describe('on submit', () => {
    describe('with the default ResetType', () => {
      it('calls resetConsumerGroupOffsets', async () => {
        const mockResetConsumerGroupOffsets = jest.fn();
        render(
          setupWrapper({
            resetConsumerGroupOffsets: mockResetConsumerGroupOffsets,
          })
        );
        await selectresetTypeAndPartitions('EARLIEST');
        await waitFor(() => {
          fireEvent.click(screen.getByText('Submit'));
        });
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledTimes(1);
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledWith(
          'testCluster',
          'testGroup',
          expectedOutputs.EARLIEST
        );
      });
    });

    describe('with the ResetType set to LATEST', () => {
      it('calls resetConsumerGroupOffsets', async () => {
        const mockResetConsumerGroupOffsets = jest.fn();
        render(
          setupWrapper({
            resetConsumerGroupOffsets: mockResetConsumerGroupOffsets,
          })
        );
        await selectresetTypeAndPartitions('LATEST');
        await waitFor(() => {
          fireEvent.click(screen.getByText('Submit'));
        });
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledTimes(1);
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledWith(
          'testCluster',
          'testGroup',
          expectedOutputs.LATEST
        );
      });
    });

    describe('with the ResetType set to OFFSET', () => {
      it('calls resetConsumerGroupOffsets', async () => {
        const mockResetConsumerGroupOffsets = jest.fn();
        render(
          setupWrapper({
            resetConsumerGroupOffsets: mockResetConsumerGroupOffsets,
          })
        );
        await selectresetTypeAndPartitions('OFFSET');
        await waitFor(() => {
          fireEvent.change(screen.getAllByLabelText('Partition #0')[1], {
            target: { value: '10' },
          });
        });
        await waitFor(() => {
          fireEvent.click(screen.getByText('Submit'));
        });
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledTimes(1);
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledWith(
          'testCluster',
          'testGroup',
          expectedOutputs.OFFSET
        );
      });
    });

    describe('with the ResetType set to TIMESTAMP', () => {
      it('adds error to the page when the input is left empty', async () => {
        const mockResetConsumerGroupOffsets = jest.fn();
        render(setupWrapper());
        await selectresetTypeAndPartitions('TIMESTAMP');
        await waitFor(() => {
          fireEvent.click(screen.getByText('Submit'));
        });
        expect(mockResetConsumerGroupOffsets).toHaveBeenCalledTimes(0);
        expect(screen.getByText("This field shouldn't be empty!")).toBeTruthy();
      });
    });
  });
});
