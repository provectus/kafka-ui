import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { ConsumingMode } from 'lib/hooks/api/topicMessages';

import { StatusTags } from './Messages.styled';
import { getModeTitle } from './utils/consumingModes';

const StatusBar = () => {
  const [searchParams] = useSearchParams();

  const mode = getModeTitle(
    (searchParams.get('m') as ConsumingMode) || undefined
  );
  const offset = searchParams.get('o');
  const timestamp = searchParams.get('t');
  const query = searchParams.get('q');

  return (
    <StatusTags>
      <Tag color="green">
        {offset || timestamp ? (
          <>
            {mode}: <b>{offset || timestamp}</b>
          </>
        ) : (
          mode
        )}
      </Tag>
      {query && (
        <Tag color="blue">
          Search: <b>{query}</b>
        </Tag>
      )}
    </StatusTags>
  );
};

export default StatusBar;
