import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { selectAll } from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import List from 'components/ConsumerGroups/List/List';

const mapStateToProps = (state: RootState) => ({
  consumerGroups: selectAll(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(List);
