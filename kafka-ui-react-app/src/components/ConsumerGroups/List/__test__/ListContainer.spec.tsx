import React from 'react';
import { containerRendersView } from 'lib/testHelpers';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import List from 'components/ConsumerGroups/List/List';

describe('ListContainer', () => {
  containerRendersView(<ListContainer />, List);
});
