import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import Select from 'components/common/Select/Select';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces';

import * as S from './GlobalSchemaSelector.styled';

export interface GlobalSchemaSelectorProps {
  globalSchemaCompatibilityLevel?: CompatibilityLevelCompatibilityEnum;
  updateGlobalSchemaCompatibilityLevel: (
    clusterName: ClusterName,
    compatibilityLevel: CompatibilityLevelCompatibilityEnum
  ) => Promise<void>;
}

const GlobalSchemaSelector: React.FC<GlobalSchemaSelectorProps> = ({
  globalSchemaCompatibilityLevel,
  updateGlobalSchemaCompatibilityLevel,
}) => {
  const [currentCompatibilityLevel, setCompatibilityLevel] = useState(
    globalSchemaCompatibilityLevel
  );
  const { clusterName } = useParams<{ clusterName: string }>();

  const methods = useForm();

  const [
    isUpdateCompatibilityConfirmationVisible,
    setUpdateCompatibilityConfirmationVisible,
  ] = React.useState(false);

  const onCompatibilityLevelUpdate = async ({
    compatibilityLevel,
  }: {
    compatibilityLevel: CompatibilityLevelCompatibilityEnum;
  }) => {
    await updateGlobalSchemaCompatibilityLevel(clusterName, compatibilityLevel);
    setUpdateCompatibilityConfirmationVisible(false);
  };

  const onCompatibilityLevelChange = ({
    target: { value: newCompatibilityLevel },
  }: {
    target: { value: string };
  }) => {
    setCompatibilityLevel(
      newCompatibilityLevel as CompatibilityLevelCompatibilityEnum
    );
    setUpdateCompatibilityConfirmationVisible(true);
  };

  const onCompatibilityLevelCancel = () => {
    setCompatibilityLevel(globalSchemaCompatibilityLevel);
    setUpdateCompatibilityConfirmationVisible(false);
  };

  return (
    <FormProvider {...methods}>
      <S.GlobalSchemaSelectorWrapper>
        <h5>Global Compatibility Level: </h5>
        <Select
          name="compatibilityLevel"
          selectSize="M"
          value={currentCompatibilityLevel}
          onChange={onCompatibilityLevelChange}
          disabled={methods.formState.isSubmitting}
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
          isOpen={isUpdateCompatibilityConfirmationVisible}
          onCancel={onCompatibilityLevelCancel}
          onConfirm={methods.handleSubmit(onCompatibilityLevelUpdate)}
          isConfirming={methods.formState.isSubmitting}
        >
          Are you sure you want to update the global compatibility level? This
          may affect the compatibility levels of the schemas.
        </ConfirmationModal>
      </S.GlobalSchemaSelectorWrapper>
    </FormProvider>
  );
};

export default GlobalSchemaSelector;
