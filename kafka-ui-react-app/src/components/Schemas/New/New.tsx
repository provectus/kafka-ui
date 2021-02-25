import React from 'react';
import { ClusterName, SchemaName, NewSchemaSubjectRaw } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';

import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterSchemasPath } from 'lib/paths';
import SchemaForm from 'components/Schemas/shared/Form/SchemaForm';
import { NewSchemaSubject } from 'generated-sources';

interface Props {
  clusterName: ClusterName;
  subject: SchemaName;
  isSchemaCreated: boolean;
  createSchema: (
    clusterName: ClusterName,
    subject: SchemaName,
    newSchemaSubject: NewSchemaSubject
  ) => void;
  redirectToSchemaPath: (clusterName: ClusterName, subject: SchemaName) => void;
  resetUploadedState: () => void;
}

const New: React.FC<Props> = ({
  clusterName,
  isSchemaCreated,
  createSchema,
  redirectToSchemaPath,
}) => {
  const methods = useForm<NewSchemaSubjectRaw>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isSubmitting && isSchemaCreated) {
      const { subject } = methods.getValues();
      redirectToSchemaPath(clusterName, subject);
    }
  }, [
    isSubmitting,
    isSchemaCreated,
    redirectToSchemaPath,
    clusterName,
    methods,
  ]);

  const onSubmit = async (data: NewSchemaSubjectRaw) => {
    console.log(data);
    // TODO: need to fix loader. After success loading the first time, we won't wait for creation any more, because state is
    // loaded, and we will try to get entity immediately after pressing the button, and we will receive null
    // going to object page on the second creation. Setting of isSubmitting after createTopic is a workaround, need to tweak loader logic
    await createSchema(clusterName, data.subject, data.schema);
    setIsSubmitting(true); // Keep this action after createTopic to prevent redirect before create.
  };

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              {
                href: clusterSchemasPath(clusterName),
                label: 'Schema Registry',
              },
            ]}
          >
            New Schema
          </Breadcrumb>
        </div>
      </div>

      <div className="box">
        {/* eslint-disable react/jsx-props-no-spreading */}
        <FormProvider {...methods}>
          <SchemaForm
            isSubmitting={isSubmitting}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default New;
