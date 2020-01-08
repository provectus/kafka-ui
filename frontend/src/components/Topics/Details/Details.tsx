import React from 'react';
import { ClusterId, Topic, TopicDetails } from 'types';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

interface Props extends Topic, TopicDetails {
  clusterId: ClusterId;
}

const Details: React.FC<Props> = ({
  clusterId,
  name,
  partitions,
  internal,
}) => {
  return (
    <div className="section">
      <Breadcrumb links={[
        { href: `/clusters/${clusterId}/topics`, label: 'All Topics' },
      ]}>
        {name}
      </Breadcrumb>

      <MetricsWrapper title="Partitions">
        <Indicator title="Under replicated partitions">
          0
        </Indicator>
        <Indicator title="Out of sync replicas">
          0
        </Indicator>
      </MetricsWrapper>
    </div>
  );
}

export default Details;
