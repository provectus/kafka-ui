import React from 'react';
import { containerRendersView } from 'lib/testHelpers';
import Details from 'components/ConsumerGroups/Details/Details';
import DetailsContainer from 'components/ConsumerGroups/Details/DetailsContainer';

describe('DetailsContainer', () => {
  containerRendersView(<DetailsContainer />, Details);
});
