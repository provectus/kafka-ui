import React from 'react';
import Select from 'components/common/Select/Select';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import { useAppDispatch } from 'lib/hooks/redux';
import usePagination from 'lib/hooks/usePagination';
import useSearch from 'lib/hooks/useSearch';
import useAppParams from 'lib/hooks/useAppParams';
import { fetchSchemas } from 'redux/reducers/schemas/schemasSlice';
import { ClusterNameRoute } from 'lib/paths';
import { schemasApiClient } from 'lib/api';
import { showServerError } from 'lib/errorHandling';
import { useConfirm } from 'lib/hooks/useConfirm';

import * as S from './GlobalSchemaSelector.styled';

const GlobalSchemaSelector: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const dispatch = useAppDispatch();
  const [searchText] = useSearch();
  const { page, perPage } = usePagination();
  const confirm = useConfirm();

  const [currentCompatibilityLevel, setCurrentCompatibilityLevel] =
    React.useState<CompatibilityLevelCompatibilityEnum | undefined>();

  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const { compatibility } =
          await schemasApiClient.getGlobalSchemaCompatibilityLevel({
            clusterName,
          });
        setCurrentCompatibilityLevel(compatibility);
      } catch (error) {
        // do nothing
      }
      setIsFetching(false);
    };

    fetchData();
  }, [clusterName]);

  const handleChangeCompatibilityLevel = (level: string | number) => {
    const nextLevel = level as CompatibilityLevelCompatibilityEnum;
    confirm(
      <>
        Are you sure you want to update the global compatibility level and set
        it to <b>{nextLevel}</b>? This may affect the compatibility levels of
        the schemas.
      </>,
      async () => {
        try {
          await schemasApiClient.updateGlobalSchemaCompatibilityLevel({
            clusterName,
            compatibilityLevel: {
              compatibility: nextLevel,
            },
          });
          setCurrentCompatibilityLevel(nextLevel);
          dispatch(
            fetchSchemas({ clusterName, page, perPage, search: searchText })
          );
        } catch (e) {
          showServerError(e as Response);
        }
      }
    );
  };

  if (!currentCompatibilityLevel) return null;

  return (
    <S.Wrapper>
      <div>Global Compatibility Level: </div>
      <Select
        selectSize="M"
        defaultValue={currentCompatibilityLevel}
        minWidth="200px"
        onChange={handleChangeCompatibilityLevel}
        disabled={isFetching}
        options={Object.keys(CompatibilityLevelCompatibilityEnum).map(
          (level) => ({ value: level, label: level })
        )}
      />
    </S.Wrapper>
  );
};

export default GlobalSchemaSelector;
