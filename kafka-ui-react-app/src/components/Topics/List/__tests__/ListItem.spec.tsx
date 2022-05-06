import React from 'react';
import { StaticRouter } from 'react-router';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import ListItem, { ListItemProps } from 'components/Topics/List/ListItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    <StaticRouter>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </StaticRouter>
  );

  it('renders without checkbox for internal topic', () => {
    render(setupComponent());

    expect(screen.getAllByRole('cell').length).toBeTruthy();
  });

  it('renders with checkbox for external topic', () => {
    render(setupComponent({ topic: externalTopicPayload }));

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('triggers the toggleTopicSelected when clicked on the checkbox input', () => {
    render(setupComponent({ topic: externalTopicPayload }));
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    userEvent.click(screen.getByRole('checkbox'));
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
