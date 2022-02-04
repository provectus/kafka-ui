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

jest.mock('components/Topics/Topic/Edit/EditContainer', () => () => (
  <div>Edit Container</div>
));
jest.mock('components/Topics/Topic/SendMessage/SendMessage', () => () => (
  <div>Send Message</div>
));
jest.mock('components/Topics/Topic/Details/DetailsContainer', () => () => (
  <div>Details Container</div>
));
jest.mock('components/common/PageLoader/PageLoader', () => () => (
  <div>Loading</div>
));

const fetchTopicDetailsMock = jest.fn();

const renderComponent = (pathname: string, topicFetching: boolean) =>
  render(
    <Route path={clusterTopicPath(':clusterName', ':topicName')}>
      <Topic
        isTopicFetching={topicFetching}
        fetchTopicDetails={fetchTopicDetailsMock}
      />
    </Route>,
    { pathname }
  );

it('renders Edit page', () => {
  renderComponent(clusterTopicEditPath('local', 'myTopicName'), false);
  expect(screen.getByText('Edit Container')).toBeInTheDocument();
});

it('renders Send Message page', () => {
  renderComponent(clusterTopicSendMessagePath('local', 'myTopicName'), false);
  expect(screen.getByText('Send Message')).toBeInTheDocument();
});

it('renders Details Container page', () => {
  renderComponent(clusterTopicPath('local', 'myTopicName'), false);
  expect(screen.getByText('Details Container')).toBeInTheDocument();
});

it('renders Page loader', () => {
  renderComponent(clusterTopicPath('local', 'myTopicName'), true);
  expect(screen.getByText('Loading')).toBeInTheDocument();
});

it('fetches topicDetails', () => {
  renderComponent(clusterTopicPath('local', 'myTopicName'), false);
  expect(fetchTopicDetailsMock).toHaveBeenCalledTimes(1);
});
