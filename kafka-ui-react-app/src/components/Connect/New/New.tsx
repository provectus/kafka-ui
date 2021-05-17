import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Connect, Connector, NewConnector } from 'generated-sources';
import { ClusterName, ConnectName } from 'redux/interfaces';
import { clusterConnectConnectorPath } from 'lib/paths';
import yup from 'lib/yupExtended';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import PageLoader from 'components/common/PageLoader/PageLoader';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  config: yup.string().required().isJsonObject(),
});

interface RouterParams {
  clusterName: ClusterName;
}

export interface NewProps {
  fetchConnects(clusterName: ClusterName): void;
  areConnectsFetching: boolean;
  connects: Connect[];
  createConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    newConnector: NewConnector
  ): Promise<Connector | undefined>;
}

interface FormValues {
  connectName: ConnectName;
  name: string;
  config: string;
}

const New: React.FC<NewProps> = ({
  fetchConnects,
  areConnectsFetching,
  connects,
  createConnector,
}) => {
  const { clusterName } = useParams<RouterParams>();
  const history = useHistory();

  const {
    register,
    errors,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid },
    getValues,
    setValue,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      connectName: connects[0]?.name || '',
      name: '',
      config: '',
    },
  });

  React.useEffect(() => {
    fetchConnects(clusterName);
  }, [fetchConnects, clusterName]);

  React.useEffect(() => {
    if (connects && connects.length > 0 && !getValues().connectName) {
      setValue('connectName', connects[0].name);
    }
  }, [connects, getValues, setValue]);

  const connectNameFieldClassName = React.useMemo(
    () => (connects.length > 1 ? '' : 'is-hidden'),
    [connects]
  );

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const connector = await createConnector(clusterName, values.connectName, {
        name: values.name,
        config: JSON.parse(values.config),
      });
      if (connector) {
        history.push(
          clusterConnectConnectorPath(
            clusterName,
            connector.connect,
            connector.name
          )
        );
      }
    },
    [createConnector, clusterName]
  );

  if (areConnectsFetching) {
    return <PageLoader />;
  }

  if (connects.length === 0) {
    return null;
  }

  return (
    <div className="box">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={['field', connectNameFieldClassName].join(' ')}>
          <label className="label">Connect *</label>
          <div className="control select">
            <select ref={register} name="connectName" disabled={isSubmitting}>
              {connects.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="connectName" />
          </p>
        </div>

        <div className="field">
          <label className="label">Name *</label>
          <div className="control">
            <input
              ref={register}
              className="input"
              placeholder="Connector Name"
              name="name"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="name" />
          </p>
        </div>

        <div className="field">
          <label className="label">Config *</label>
          <div className="control">
            <Controller
              control={control}
              name="config"
              render={({ name, onChange, onBlur }) => (
                <JSONEditor
                  ref={register}
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  readOnly={isSubmitting}
                />
              )}
            />
          </div>
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="config" />
          </p>
        </div>
        <div className="field">
          <div className="control">
            <input
              type="submit"
              className="button is-primary"
              disabled={!isValid || isSubmitting || !isDirty}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default New;
