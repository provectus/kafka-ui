import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getConsumerGroupsOrderBy,
  getConsumerGroupsTotalPages,
  selectAll,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import List from 'components/ConsumerGroups/List/List';

const mapStateToProps = (state: RootState) => ({
  consumerGroups: selectAll(state),
  orderBy: getConsumerGroupsOrderBy(state),
  totalPages: getConsumerGroupsTotalPages(state),
});

export default connect(mapStateToProps)(List);
