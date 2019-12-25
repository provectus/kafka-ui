import {
  getClusters,
} from 'lib/api';
import {
  fetchClusterListAction,
} from './actions';
import { Cluster, PromiseThunk } from 'types';

export const fetchClustersList = (): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchClusterListAction.request());

  try {
    const clusters: Cluster[] = await getClusters();

    dispatch(fetchClusterListAction.success(clusters));
  } catch (e) {
    dispatch(fetchClusterListAction.failure());
  }
}
