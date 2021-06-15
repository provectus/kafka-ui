import React from 'react';
import { containerRendersView } from 'lib/testHelpers';
import Brokers from 'components/Brokers/Brokers';
import BrokersContainer from 'components/Brokers/BrokersContainer';

describe('BrokersContainer', () => {
  containerRendersView(<BrokersContainer />, Brokers);
});
