import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getConsumerGroupsOrderBy,
  getConsumerGroupsSortOrder,
  getConsumerGroupsTotalPages,
  consumerGroupsActions,
  selectAll,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import List from 'components/ConsumerGroups/List/List';

const mapStateToProps = (state: RootState) => ({
  consumerGroups: selectAll(state),
  orderBy: getConsumerGroupsOrderBy(state),
  sortOrder: getConsumerGroupsSortOrder(state),
  totalPages: getConsumerGroupsTotalPages(state),
});

const mapDispatchToProps = {
  setConsumerGroupsOrder: consumerGroupsActions.orderBy,
  setConsumerSortOrder: consumerGroupsActions.sortBy,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
