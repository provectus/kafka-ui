import React from 'react';
import { Route } from 'react-router-dom';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Topic from 'components/Topics/Topic/Topic';
import {
  clusterTopicPath,
  clusterTopicEditPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';

const topicText = {
  edit: 'Edit Container',
  send: 'Send Message',
  detail: 'Details Container',
  loading: 'Loading',
};

jest.mock('components/Topics/Topic/Edit/EditContainer', () => () => (
  <div>{topicText.edit}</div>
));
jest.mock('components/Topics/Topic/SendMessage/SendMessage', () => () => (
  <div>{topicText.send}</div>
));
jest.mock('components/Topics/Topic/Details/DetailsContainer', () => () => (
  <div>{topicText.detail}</div>
));
jest.mock('components/common/PageLoader/PageLoader', () => () => (
  <div>{topicText.loading}</div>
));

describe('Topic Component', () => {
  const resetTopicMessages = jest.fn();
  const fetchTopicDetailsMock = jest.fn();

  const renderComponent = (pathname: string, topicFetching: boolean) =>
    render(
      <Route path={clusterTopicPath()}>
        <Topic
          isTopicFetching={topicFetching}
          resetTopicMessages={resetTopicMessages}
          fetchTopicDetails={fetchTopicDetailsMock}
        />
      </Route>,
      { pathname }
    );

  afterEach(() => {
    resetTopicMessages.mockClear();
    fetchTopicDetailsMock.mockClear();
  });

  it('renders Edit page', () => {
    renderComponent(clusterTopicEditPath('local', 'myTopicName'), false);
    expect(screen.getByText(topicText.edit)).toBeInTheDocument();
  });

  it('renders Send Message page', () => {
    renderComponent(clusterTopicSendMessagePath('local', 'myTopicName'), false);
    expect(screen.getByText(topicText.send)).toBeInTheDocument();
  });

  it('renders Details Container page', () => {
    renderComponent(clusterTopicPath('local', 'myTopicName'), false);
    expect(screen.getByText(topicText.detail)).toBeInTheDocument();
  });

  it('renders Page loader', () => {
    renderComponent(clusterTopicPath('local', 'myTopicName'), true);
    expect(screen.getByText(topicText.loading)).toBeInTheDocument();
  });

  it('fetches topicDetails', () => {
    renderComponent(clusterTopicPath('local', 'myTopicName'), false);
    expect(fetchTopicDetailsMock).toHaveBeenCalledTimes(1);
  });

  it('resets topic messages after unmount', () => {
    const component = renderComponent(
      clusterTopicPath('local', 'myTopicName'),
      false
    );
    component.unmount();
    expect(resetTopicMessages).toHaveBeenCalledTimes(1);
  });
});
