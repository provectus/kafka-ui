import React from 'react';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
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

import * as S from './GlobalSchemaSelector.styled';

const GlobalSchemaSelector: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const dispatch = useAppDispatch();
  const [searchText] = useSearch();
  const { page, perPage } = usePagination();

  const [currentCompatibilityLevel, setCurrentCompatibilityLevel] =
    React.useState<CompatibilityLevelCompatibilityEnum | undefined>();
  const [nextCompatibilityLevel, setNextCompatibilityLevel] = React.useState<
    CompatibilityLevelCompatibilityEnum | undefined
  >();

  const [isFetching, setIsFetching] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] =
    React.useState(false);

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
    setNextCompatibilityLevel(level as CompatibilityLevelCompatibilityEnum);
    setIsConfirmationVisible(true);
  };

  const handleUpdateCompatibilityLevel = async () => {
    setIsUpdating(true);
    if (nextCompatibilityLevel) {
      try {
        await schemasApiClient.updateGlobalSchemaCompatibilityLevel({
          clusterName,
          compatibilityLevel: { compatibility: nextCompatibilityLevel },
        });
        setCurrentCompatibilityLevel(nextCompatibilityLevel);
        setNextCompatibilityLevel(undefined);
        setIsConfirmationVisible(false);
        dispatch(
          fetchSchemas({ clusterName, page, perPage, search: searchText })
        );
      } catch (e) {
        showServerError(e as Response);
      }
    }
    setIsUpdating(false);
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
        disabled={isFetching || isUpdating || isConfirmationVisible}
        options={Object.keys(CompatibilityLevelCompatibilityEnum).map(
          (level) => ({ value: level, label: level })
        )}
      />
      <ConfirmationModal
        isOpen={isConfirmationVisible}
        onCancel={() => setIsConfirmationVisible(false)}
        onConfirm={handleUpdateCompatibilityLevel}
        isConfirming={isUpdating}
      >
        Are you sure you want to update the global compatibility level and set
        it to <b>{nextCompatibilityLevel}</b>? This may affect the compatibility
        levels of the schemas.
      </ConfirmationModal>
    </S.Wrapper>
  );
};

export default GlobalSchemaSelector;
