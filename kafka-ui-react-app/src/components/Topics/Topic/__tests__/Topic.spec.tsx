import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Topic from 'components/Topics/Topic/Topic';
import {
  clusterTopicPath,
  clusterTopicEditPath,
  clusterTopicSendMessagePath,
  getNonExactPath,
} from 'lib/paths';
import { useAppDispatch } from 'lib/hooks/redux';

const topicText = {
  edit: 'Edit',
  send: 'Send Message',
  detail: 'Details',
  loading: 'Loading',
};

jest.mock('components/Topics/Topic/Edit/Edit', () => () => (
  <div>{topicText.edit}</div>
));
jest.mock('components/Topics/Topic/SendMessage/SendMessage', () => () => (
  <div>{topicText.send}</div>
));
jest.mock('components/Topics/Topic/Details/Details', () => () => (
  <div>{topicText.detail}</div>
));

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: jest.fn(),
}));
const useDispatchMock = jest.fn(jest.fn());

describe('Topic Component', () => {
  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockImplementation(() => useDispatchMock);
  });

  const renderComponent = (pathname: string) =>
    render(
      <WithRoute path={getNonExactPath(clusterTopicPath())}>
        <Topic />
      </WithRoute>,
      { initialEntries: [pathname] }
    );

  it('renders Edit page', () => {
    renderComponent(clusterTopicEditPath('local', 'myTopicName'));
    expect(screen.getByText(topicText.edit)).toBeInTheDocument();
  });

  it('renders Send Message page', () => {
    renderComponent(clusterTopicSendMessagePath('local', 'myTopicName'));
    expect(screen.getByText(topicText.send)).toBeInTheDocument();
  });

  it('renders Details Container page', () => {
    renderComponent(clusterTopicPath('local', 'myTopicName'));
    expect(screen.getByText(topicText.detail)).toBeInTheDocument();
  });

  it('resets topic messages after unmount', () => {
    const component = renderComponent(clusterTopicPath('local', 'myTopicName'));
    component.unmount();
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });
});
