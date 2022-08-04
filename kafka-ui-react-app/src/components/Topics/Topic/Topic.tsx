import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  clusterTopicEditRelativePath,
  clusterTopicSendMessageRelativePath,
} from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { resetTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { useAppDispatch } from 'lib/hooks/redux';

import SendMessage from './SendMessage/SendMessage';
import Details from './Details/Details';
import Edit from './Edit/Edit';

const Topic: React.FC = () => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    return () => {
      dispatch(resetTopicMessages());
    };
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="*" element={<Details />} />
        <Route path={clusterTopicEditRelativePath} element={<Edit />} />
        <Route
          path={clusterTopicSendMessageRelativePath}
          element={<SendMessage />}
        />
      </Routes>
    </Suspense>
  );
};

export default Topic;
