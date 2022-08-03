import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clusterTopicNewRelativePath } from 'lib/paths';
import { PER_PAGE } from 'lib/constants';
import ClusterContext from 'components/contexts/ClusterContext';
import Search from 'components/common/Search/Search';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Switch from 'components/common/Switch/Switch';
import PlusIcon from 'components/common/Icons/PlusIcon';
import useSearch from 'lib/hooks/useSearch';
import PageLoader from 'components/common/PageLoader/PageLoader';
import TopicsTable from 'components/Topics/List/TopicsTable';

const ListPage: React.FC = () => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const [searchQuery, handleSearchQuery] = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Set the search params to the url based on the localStorage value
  React.useEffect(() => {
    if (!searchParams.has('perPage')) {
      searchParams.set('perPage', String(PER_PAGE));
    }
    if (
      !!localStorage.getItem('hideInternalTopics') &&
      !searchParams.has('hideInternal')
    ) {
      searchParams.set('hideInternal', 'true');
    }
    setSearchParams(searchParams, { replace: true });
  }, []);

  const handleSwitch = () => {
    if (searchParams.has('hideInternal')) {
      localStorage.removeItem('hideInternalTopics');
      searchParams.delete('hideInternal');
    } else {
      localStorage.setItem('hideInternalTopics', 'true');
      searchParams.set('hideInternal', 'true');
    }
    // Page must be reset when the switch is toggled
    searchParams.delete('page');
    setSearchParams(searchParams.toString(), { replace: true });
  };

  return (
    <>
      <PageHeading text="All Topics">
        {!isReadOnly && (
          <Button
            buttonType="primary"
            buttonSize="M"
            to={clusterTopicNewRelativePath}
          >
            <PlusIcon /> Add a Topic
          </Button>
        )}
      </PageHeading>
      <ControlPanelWrapper hasInput>
        <div>
          <Search
            handleSearch={handleSearchQuery}
            placeholder="Search by Topic Name"
            value={searchQuery}
          />
        </div>
        <div>
          <label>
            <Switch
              name="ShowInternalTopics"
              checked={!searchParams.has('hideInternal')}
              onChange={handleSwitch}
            />
            Show Internal Topics
          </label>
        </div>
      </ControlPanelWrapper>
      <Suspense fallback={<PageLoader />}>
        <TopicsTable />
      </Suspense>
    </>
  );
};

export default ListPage;
