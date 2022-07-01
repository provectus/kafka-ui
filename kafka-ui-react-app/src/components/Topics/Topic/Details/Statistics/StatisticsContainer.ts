import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicConfig } from 'redux/reducers/topics/topicsSlice';
import { getTopicConfigFetched } from 'redux/reducers/topics/selectors';

import Statistics from './Statistics';

const mapStateToProps = (state: RootState) => ({
  isFetched: getTopicConfigFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConfig,
};

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
