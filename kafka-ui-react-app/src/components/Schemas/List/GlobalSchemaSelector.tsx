import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces';

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
  const { clusterName } = useParams<{ clusterName: string }>();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

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

  return (
    <div className="level-item">
      <h5 className="is-5 mr-2">Global Compatibility Level: </h5>
      <div className="select mr-2">
        <select
          name="compatibilityLevel"
          defaultValue={globalSchemaCompatibilityLevel}
          ref={register()}
          onChange={() => setUpdateCompatibilityConfirmationVisible(true)}
        >
          {Object.keys(CompatibilityLevelCompatibilityEnum).map(
            (level: string) => (
              <option key={level} value={level}>
                {level}
              </option>
            )
          )}
        </select>
      </div>
      <ConfirmationModal
        isOpen={isUpdateCompatibilityConfirmationVisible}
        onCancel={() => setUpdateCompatibilityConfirmationVisible(false)}
        onConfirm={handleSubmit(onCompatibilityLevelUpdate)}
      >
        {isSubmitting ? (
          <PageLoader />
        ) : (
          `Are you sure you want to update the global compatibility level?
                  This may affect the compatibility levels of the schemas.`
        )}
      </ConfirmationModal>
    </div>
  );
};

export default GlobalSchemaSelector;
