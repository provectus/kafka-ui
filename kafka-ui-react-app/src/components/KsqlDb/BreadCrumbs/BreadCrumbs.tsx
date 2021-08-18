import React from 'react';
import Breadcrumb, {
  BreadcrumbItem,
} from 'components/common/Breadcrumb/Breadcrumb';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';
import { useParams, useRouteMatch } from 'react-router';

interface RouteParams {
  clusterName: string;
}

const Breadcrumbs: React.FC = () => {
  const { clusterName } = useParams<RouteParams>();
  const isQuery = useRouteMatch(clusterKsqlDbQueryPath(clusterName));

  if (!isQuery) {
    return <Breadcrumb>KSQLDB</Breadcrumb>;
  }

  const links: BreadcrumbItem[] = [
    {
      label: 'KSQLDB',
      href: clusterKsqlDbPath(clusterName),
    },
  ];

  return <Breadcrumb links={links}>Query</Breadcrumb>;
};

export default Breadcrumbs;
