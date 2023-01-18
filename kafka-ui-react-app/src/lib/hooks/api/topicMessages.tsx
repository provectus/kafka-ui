import React from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { BASE_PARAMS, MESSAGES_PER_PAGE } from 'lib/constants';
import { ClusterName } from 'redux/interfaces';
import {
  GetSerdesRequest,
  SeekDirection,
  SeekType,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
} from 'generated-sources';
import { showServerError } from 'lib/errorHandling';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { messagesApiClient } from 'lib/api';
import { StopLoading } from 'components/Topics/Topic/Messages/Messages.styled';

interface UseTopicMessagesProps {
  clusterName: ClusterName;
  topicName: string;
  searchParams: URLSearchParams;
}

export type ConsumingMode =
  | 'live'
  | 'oldest'
  | 'newest'
  | 'fromOffset' // from 900 -> 1000
  | 'toOffset' // from 900 -> 800
  | 'sinceTime' // from 10:15 -> 11:15
  | 'untilTime'; // from 10:15 -> 9:15

export const useTopicMessages = ({
  clusterName,
  topicName,
  searchParams,
}: UseTopicMessagesProps) => {
  const [messages, setMessages] = React.useState<TopicMessage[]>([]);
  const [phase, setPhase] = React.useState<string>();
  const [meta, setMeta] = React.useState<TopicMessageConsuming>();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const abortController = new AbortController();

  // get initial properties
  const mode = searchParams.get('m') as ConsumingMode;
  const limit = searchParams.get('perPage') || MESSAGES_PER_PAGE;
  const seekTo = searchParams.get('seekTo') || '0-0';

  React.useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/topics/${topicName}/messages`;
      const requestParams = new URLSearchParams({
        limit,
        seekTo: seekTo.replaceAll('-', '::').replaceAll('.', ','),
        q: searchParams.get('q') || '',
        keySerde: searchParams.get('keySerde') || '',
        valueSerde: searchParams.get('valueSerde') || '',
      });

      switch (mode) {
        case 'live':
          requestParams.set('seekDirection', SeekDirection.TAILING);
          requestParams.set('seekType', SeekType.LATEST);
          break;
        case 'oldest':
          requestParams.set('seekType', SeekType.BEGINNING);
          requestParams.set('seekDirection', SeekDirection.FORWARD);
          break;
        case 'newest':
          requestParams.set('seekType', SeekType.LATEST);
          requestParams.set('seekDirection', SeekDirection.BACKWARD);
          break;
        case 'fromOffset':
          requestParams.set('seekType', SeekType.OFFSET);
          requestParams.set('seekDirection', SeekDirection.FORWARD);
          break;
        case 'toOffset':
          requestParams.set('seekType', SeekType.OFFSET);
          requestParams.set('seekDirection', SeekDirection.BACKWARD);
          break;
        case 'sinceTime':
          requestParams.set('seekType', SeekType.TIMESTAMP);
          requestParams.set('seekDirection', SeekDirection.FORWARD);
          break;
        case 'untilTime':
          requestParams.set('seekType', SeekType.TIMESTAMP);
          requestParams.set('seekDirection', SeekDirection.BACKWARD);
          break;
        default:
          break;
      }

      await fetchEventSource(`${url}?${requestParams.toString()}`, {
        method: 'GET',
        signal: abortController.signal,
        openWhenHidden: true,
        async onopen(response) {
          const { ok, status } = response;
          if (ok && status === 200) {
            // Reset list of messages.
            setMessages([]);
          } else if (status >= 400 && status < 500 && status !== 429) {
            showServerError(response);
          }
        },
        onmessage(event) {
          const parsedData: TopicMessageEvent = JSON.parse(event.data);
          const { message, consuming } = parsedData;

          switch (parsedData.type) {
            case TopicMessageEventTypeEnum.MESSAGE:
              if (message) {
                setMessages((prevMessages) => {
                  if (mode === 'live') {
                    return [message, ...prevMessages];
                  }
                  return [...prevMessages, message];
                });
              }
              break;
            case TopicMessageEventTypeEnum.PHASE:
              if (parsedData.phase?.name) setPhase(parsedData.phase.name);
              break;
            case TopicMessageEventTypeEnum.CONSUMING:
              if (consuming) setMeta(consuming);
              break;
            default:
          }
        },
        onclose() {
          setIsFetching(false);
        },
        onerror(err) {
          setIsFetching(false);
          showServerError(err);
        },
      });
    };
    const abortFetchData = () => {
      setIsFetching(false);
      abortController.abort();
    };

    if (mode === 'live') {
      toast.promise(
        fetchData(),
        {
          loading: (
            <>
              <div>Consuming messages...</div>
              &nbsp;
              <StopLoading onClick={abortFetchData}>Abort</StopLoading>
            </>
          ),
          success: 'Cancelled',
          error: 'Something went wrong. Please try again.',
        },
        {
          id: 'messages',
          position: 'top-center',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - missing type for icon
          success: { duration: 10, icon: false },
        }
      );
    } else {
      fetchData();
    }

    return abortFetchData;
  }, [searchParams]);

  return {
    phase,
    messages,
    meta,
    isFetching,
  };
};

export function useSerdes(props: GetSerdesRequest) {
  const { clusterName, topicName, use } = props;

  return useQuery(
    ['clusters', clusterName, 'topics', topicName, 'serdes', use],
    () => messagesApiClient.getSerdes(props),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );
}
