import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import Select from 'components/common/Select/Select';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import { getResponse } from 'lib/errorHandling';
import { useAppDispatch } from 'lib/hooks/redux';
import React from 'react';
import { useParams } from 'react-router-dom';
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import {
  fetchSchemas,
  schemasApiClient,
} from 'redux/reducers/schemas/schemasSlice';

import * as S from './GlobalSchemaSelector.styled';

const GlobalSchemaSelector: React.FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const dispatch = useAppDispatch();
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
  }, []);

  const handleChangeCompatibilityLevel = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNextCompatibilityLevel(
      event.target.value as CompatibilityLevelCompatibilityEnum
    );
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
        dispatch(fetchSchemas({ clusterName }));
        setCurrentCompatibilityLevel(nextCompatibilityLevel);
        setNextCompatibilityLevel(undefined);
        setIsConfirmationVisible(false);
      } catch (e) {
        const err = await getResponse(e as Response);
        dispatch(serverErrorAlertAdded(err));
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
        value={currentCompatibilityLevel}
        onChange={handleChangeCompatibilityLevel}
        disabled={isFetching || isUpdating || isConfirmationVisible}
      >
        {Object.keys(CompatibilityLevelCompatibilityEnum).map(
          (level: string) => (
            <option key={level} value={level}>
              {level}
            </option>
          )
        )}
      </Select>
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
