import { connect } from 'react-redux';
import { RootState, TopicName, ClusterName } from 'redux/interfaces';
import { getTopicByName } from 'redux/reducers/topics/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Overview from './Overview';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { topicName },
    },
  }: OwnProps
) => ({
  ...getTopicByName(state, topicName),
});

export default withRouter(connect(mapStateToProps)(Overview));
