import { TopicMessage } from 'generated-sources';
import { ConsumingMode } from 'lib/hooks/api/topicMessages';

export default (
  messages: TopicMessage[],
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void
) => {
  const seekTo = searchParams.get('seekTo');
  const mode = searchParams.get('m') as ConsumingMode;
  const page = searchParams.get('page');
  if (!seekTo || !mode) return;

  // parse current seekTo query param to array of [partition, offset] tuples
  const configTuple = seekTo?.split('.').map((item) => {
    const [partition, offset] = item.split('-');
    return { partition: Number(partition), offset: Number(offset) };
  });

  // Reverse messages array for faster last displayed message search.
  const reversedMessages = [...messages].reverse();

  if (!configTuple) return;

  const newConfigTuple = configTuple.map(({ partition, offset }) => {
    const message = reversedMessages.find((m) => partition === m.partition);
    if (!message) {
      return { partition, offset };
    }

    switch (mode) {
      case 'fromOffset':
        // First message in the reversed array is the message with max offset.
        // Replace offset in seekTo query param with the max offset for
        // each partition from displayed messages array.
        return { partition, offset: Math.max(message.offset, offset) };
      case 'toOffset':
        // First message in the reversed array is the message with min offset.
        return { partition, offset: Math.min(message.offset, offset) };
      case 'oldest':
      case 'newest':
        return { partition, offset: message.offset };
      case 'sinceTime':
        // First message in the reversed array is the message with max timestamp.
        return {
          partition,
          offset: Math.max(new Date(message.timestamp).getTime(), offset),
        };
      case 'untilTime':
        // First message in the reversed array is the message with min timestamp.
        return {
          partition,
          offset: Math.min(new Date(message.timestamp).getTime(), offset),
        };
      default:
        return { partition, offset };
    }
  });
  searchParams.set('page', String(Number(page || 0) + 1));
  searchParams.set(
    'seekTo',
    newConfigTuple.map((t) => `${t.partition}-${t.offset}`).join('.')
  );

  setSearchParams(searchParams);
};
