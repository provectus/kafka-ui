import React from 'react';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import ListItem, { ListItemProps } from 'components/Topics/List/ListItem';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

const mockDelete = jest.fn();
const clusterName = 'local';
const mockDeleteMessages = jest.fn();
const mockToggleTopicSelected = jest.fn();
const mockRecreateTopic = jest.fn();
jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ['TOPIC_DELETION'],
}));

describe('ListItem', () => {
  const setupComponent = (props: Partial<ListItemProps> = {}) => (
    <table>
      <tbody>
        <ListItem
          topic={internalTopicPayload}
          deleteTopic={mockDelete}
          clusterName={clusterName}
          clearTopicMessages={mockDeleteMessages}
          recreateTopic={mockRecreateTopic}
          selected={false}
          toggleTopicSelected={mockToggleTopicSelected}
          {...props}
        />
      </tbody>
    </table>
  );

  const getCheckbox = () => screen.getByRole('checkbox');

  it('renders without checkbox for internal topic', () => {
    render(setupComponent({ topic: internalTopicPayload }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders with checkbox for external topic', () => {
    render(setupComponent({ topic: externalTopicPayload }));

    expect(getCheckbox()).toBeInTheDocument();
  });

  it('triggers the toggleTopicSelected when clicked on the checkbox input', () => {
    render(setupComponent({ topic: externalTopicPayload }));
    expect(getCheckbox()).toBeInTheDocument();
    userEvent.click(getCheckbox());
    expect(mockToggleTopicSelected).toBeCalledTimes(1);
    expect(mockToggleTopicSelected).toBeCalledWith(externalTopicPayload.name);
  });

  it('renders correct out of sync replicas number', () => {
    render(
      setupComponent({
        topic: { ...externalTopicPayload, partitions: undefined },
      })
    );

    expect(screen.getAllByRole('cell', { name: '0' }).length).toBeTruthy();
  });
});
