import { connect } from 'react-redux';
import ClustersWidget from './ClustersWidget';
import {
  getClusterList,
  getOnlineClusters,
  getOfflineClusters,
} from 'redux/reducers/clusters/selectors';
import { RootState } from 'lib/interfaces';

const mapStateToProps = (state: RootState) => ({
  clusters: getClusterList(state),
  onlineClusters: getOnlineClusters(state),
  offlineClusters: getOfflineClusters(state),
});

export default connect(mapStateToProps)(ClustersWidget);
