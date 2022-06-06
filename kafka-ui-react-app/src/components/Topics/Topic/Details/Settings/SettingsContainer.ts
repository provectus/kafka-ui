import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicConfig } from 'redux/reducers/topics/topicsSlice';
import { getTopicConfigFetched } from 'redux/reducers/topics/selectors';

import Settings from './Settings';

const mapStateToProps = (state: RootState) => ({
  isFetched: getTopicConfigFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConfig,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
