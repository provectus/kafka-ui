import React from 'react';
import { ConsumingMode, useTopicMessages } from 'lib/hooks/api/topicMessages';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTopicDetails } from 'lib/hooks/api/topics';
import { MESSAGES_PER_PAGE } from 'lib/constants';
import Search from 'components/common/Search/Search';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import SlidingSidebar from 'components/common/SlidingSidebar';
import useBoolean from 'lib/hooks/useBoolean';

import MessagesTable from './MessagesTable/MessagesTable';
import * as S from './Messages.styled';
import Meta from './FiltersBar/Meta';
import Form from './FiltersBar/Form';
import { setSeekTo } from './FiltersBar/utils';
import handleNextPageClick from './utils/handleNextPageClick';
import StatusBar from './StatusBar';
import AdvancedFilter from './Advanced Filter/AdvancedFilter';

const Messages = () => {
  const routerProps = useAppParams<RouteParamsClusterTopic>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    value: isAdvancedFiltersSidebarVisible,
    setFalse: closeAdvancedFiltersSidebar,
    setTrue: openAdvancedFiltersSidebar,
  } = useBoolean();
  const { messages, meta, phase, isFetching } = useTopicMessages({
    ...routerProps,
    searchParams,
  });
  const mode = searchParams.get('m') as ConsumingMode;
  const isTailing = mode === 'live' && isFetching;
  const { data: topic = { partitions: [] } } = useTopicDetails(routerProps);

  const partitions = topic.partitions || [];

  /**
   * Search params:
   * - `q` - search query
   * - `m` - way the consumer is going to consume the messages..
   * - `o` - offset
   * - `t` - timestamp
   * - `perPage` - number of messages per page
   * - `seekTo` - offset or timestamp to seek to.
   *    Format: `0-101.1-987` - [partition 0, offset 101], [partition 1, offset 987]
   * - `page` - page number
   */
  React.useEffect(() => {
    if (!mode) {
      searchParams.set('m', 'newest');
    }
    if (!searchParams.get('perPage')) {
      searchParams.set('perPage', MESSAGES_PER_PAGE);
    }
    if (!searchParams.get('seekTo')) {
      setSeekTo(searchParams, partitions);
    }
    setSearchParams(searchParams);
  }, [topic]);

  // Pagination is disabled in live mode, also we don't want to show the button
  // if we are fetching the messages or if we are at the end of the topic
  const isPaginationDisabled =
    isTailing ||
    ['newest', 'oldest'].includes(mode) || // TODO: remove after BE is fixed
    isFetching ||
    !searchParams.get('seekTo');

  const isNextPageButtonDisabled =
    isPaginationDisabled ||
    messages.length < Number(searchParams.get('perPage') || MESSAGES_PER_PAGE);
  const isPrevPageButtonDisabled =
    isPaginationDisabled || !searchParams.get('page');

  const handleNextPage = () =>
    handleNextPageClick(messages, searchParams, setSearchParams);

  return (
    <>
      <S.Wrapper>
        <S.Sidebar>
          <Meta meta={meta} phase={phase} isFetching={isFetching} />
          <S.SidebarContent>
            <Search placeholder="Search" />
            <Form isFetching={isFetching} partitions={partitions} />
          </S.SidebarContent>
          <S.Pagination>
            <Button
              buttonType="secondary"
              buttonSize="L"
              disabled={isPrevPageButtonDisabled}
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="L"
              disabled={isNextPageButtonDisabled}
              onClick={handleNextPage}
            >
              Next →
            </Button>
          </S.Pagination>
        </S.Sidebar>
        <S.TableWrapper>
          <S.StatusBarWrapper>
            <StatusBar />
            <Button
              buttonType="primary"
              buttonSize="S"
              onClick={openAdvancedFiltersSidebar}
            >
              <PlusIcon />
              Advanced Filter
            </Button>
          </S.StatusBarWrapper>
          <MessagesTable messages={messages} isLive={isTailing} />
        </S.TableWrapper>
      </S.Wrapper>
      <SlidingSidebar
        title="Advanced filtering"
        open={isAdvancedFiltersSidebarVisible}
        onClose={closeAdvancedFiltersSidebar}
      >
        <AdvancedFilter />
      </SlidingSidebar>
    </>
  );
};

export default Messages;
