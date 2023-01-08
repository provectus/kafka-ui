import React, { Suspense } from 'react';
import { ConsumingMode, useSerdes } from 'lib/hooks/api/topicMessages';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { useSearchParams } from 'react-router-dom';
import { useTopicDetails } from 'lib/hooks/api/topics';
import { MESSAGES_PER_PAGE } from 'lib/constants';
import { useMessageFiltersStore } from 'lib/hooks/useMessageFiltersStore';
import { SerdeUsage } from 'generated-sources';

import { setSeekTo } from './FiltersBar/utils';
import { getDefaultSerdeName } from './utils/getDefaultSerdeName';
import Messages from './Messages';

const MessagesContainer = () => {
  const routerProps = useAppParams<RouteParamsClusterTopic>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: serdes = {} } = useSerdes({
    ...routerProps,
    use: SerdeUsage.DESERIALIZE,
  });
  const mode = searchParams.get('m') as ConsumingMode;
  const { data: topic = { partitions: [] } } = useTopicDetails(routerProps);
  const partitions = topic.partitions || [];

  const activeFilterValue = useMessageFiltersStore(
    (state) => state.activeFilter?.value
  );

  /**
   * Search params:
   * - `q` - search query
   * - `m` - way the consumer is going to consume the messages..
   * - `o` - offset
   * - `t` - timestamp
   * - `q` - search query
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
    if (!searchParams.get('keySerde')) {
      searchParams.set('keySerde', getDefaultSerdeName(serdes.key || []));
    }
    if (!searchParams.get('valueSerde')) {
      searchParams.set('valueSerde', getDefaultSerdeName(serdes.value || []));
    }

    if (activeFilterValue && searchParams.get('q') !== activeFilterValue) {
      searchParams.set('q', activeFilterValue);
    }

    setSearchParams(searchParams);
  }, [topic, serdes, activeFilterValue]);

  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
};

export default MessagesContainer;
