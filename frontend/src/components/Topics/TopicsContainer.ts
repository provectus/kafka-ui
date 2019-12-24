import { connect } from 'react-redux';
import {
  fetchTopicList,
  fetchBrokers,
} from 'redux/reducers/topics/thunks';
import Topics from './Topics';
import { getIsTopicListFetched } from 'redux/reducers/topics/selectors';
import { RootState } from 'types';

const mapStateToProps = (state: RootState) => ({
  isFetched: getIsTopicListFetched(state),
});

const mapDispatchToProps = {
  fetchTopicList,
  fetchBrokers,
}

export default connect(mapStateToProps, mapDispatchToProps)(Topics);
