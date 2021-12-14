import { connect } from 'react-redux';
import {
  getClusterList,
  getOnlineClusters,
  getOfflineClusters,
} from 'redux/reducers/clusters/clustersSlice';
import { RootState } from 'redux/interfaces';

import ClustersWidget from './ClustersWidget';

const mapStateToProps = (state: RootState) => ({
  clusters: getClusterList(state),
  onlineClusters: getOnlineClusters(state),
  offlineClusters: getOfflineClusters(state),
});

export default connect(mapStateToProps)(ClustersWidget);
