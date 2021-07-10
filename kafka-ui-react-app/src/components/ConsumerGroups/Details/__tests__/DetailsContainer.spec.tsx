import React from 'react';
import { containerRendersView } from 'lib/testHelpers';
import DetailsContainer from 'components/ConsumerGroups/Details/DetailsContainer';
import Details from 'components/ConsumerGroups/Details/Details';

describe('Details', () => {
  containerRendersView(<DetailsContainer />, Details);
});
