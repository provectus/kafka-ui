import { configureStore } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import topics from 'redux/reducers/topics/reducer';
import topicMessages from 'redux/reducers/topicMessages/reducer';
import clusters from 'redux/reducers/clusters/reducer';
import brokers from 'redux/reducers/brokers/reducer';
import consumerGroups from 'redux/reducers/consumerGroups/reducer';
import schemas from 'redux/reducers/schemas/reducer';
import connect from 'redux/reducers/connect/reducer';
import loader from 'redux/reducers/loader/reducer';
import alerts from 'redux/reducers/alerts/reducer';
import ksqlDb from 'redux/reducers/ksqlDb/reducer';

export const store = configureStore<RootState>({
  reducer: {
    topics,
    topicMessages,
    clusters,
    brokers,
    consumerGroups,
    schemas,
    connect,
    loader,
    alerts,
    ksqlDb,
  },
});
