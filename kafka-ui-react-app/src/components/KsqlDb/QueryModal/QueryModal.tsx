import React, { FC, useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { Controller, useForm } from 'react-hook-form';
import { ksqlDbApiClient } from 'redux/actions/thunks/ksqlDb';
import Tabs from 'components/common/Tabs/Tabs';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import { isEmpty } from 'lodash';

export interface QueryModalProps {
  isOpen?: boolean;
  onSubmit?(): void;
  onCancel(): void;
  clusterName: string;
  isConfirming?: boolean;
}

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
  streamProperties: yup.string().optional(),
});

const TABS_INITIAL_PAGE = 0;
const RESULT_INITIAL_VALUE = {};

const QueryModal: FC<QueryModalProps> = ({
  isOpen,
  clusterName,
  onCancel,
  onSubmit,
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  const [result, setResult] = useState(RESULT_INITIAL_VALUE);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback(async (values: FormValues) => {
    const response = await ksqlDbApiClient.executeKsqlCommand({
      clusterName,
      ksqlCommand: {
        ...values,
        streamsProperties: JSON.parse(values.streamsProperties),
      },
    });
    setResult(response);
    onSubmit?.();
  }, []);

  const cancelHandler = React.useCallback(() => {
    if (!isConfirming) {
      onCancel();
    }
  }, [isConfirming, onCancel]);

  const handleTabsIndexChange = (index: number) => {
    if (index === TABS_INITIAL_PAGE) {
      setResult(RESULT_INITIAL_VALUE);
    }
  };

  return (
    <div className="modal is-active">
      <div
        className="modal-background"
        onClick={cancelHandler}
        aria-hidden="true"
      />
      <form className="modal-card" onSubmit={handleSubmit(submitHandler)}>
        <header className="modal-card-head">
          <p className="modal-card-title">Execute a query</p>
          <button
            onClick={cancelHandler}
            type="button"
            className="delete"
            aria-label="close"
            disabled={isConfirming}
          />
        </header>
        <section className="modal-card-body">
          <Tabs
            tabs={['Query', 'Result']}
            defaultSelectedIndex={Number(!isEmpty(result))}
            onChange={handleTabsIndexChange}
          >
            <div>
              <Tabs
                tabs={['KSQL', 'Additional Params']}
                defaultSelectedIndex={Number(!isEmpty(result))}
                onChange={handleTabsIndexChange}
              >
                <div className="control">
                  <Controller
                    control={control}
                    name="ksql"
                    render={({ field }) => (
                      <SQLEditor {...field} readOnly={isSubmitting} />
                    )}
                  />
                </div>
                <div className="control">
                  <Controller
                    control={control}
                    name="streamsProperties"
                    render={({ field }) => (
                      <JSONEditor {...field} readOnly={isSubmitting} />
                    )}
                  />
                </div>
              </Tabs>
              <button
                type="submit"
                className="button is-primary mt-2"
                disabled={isConfirming}
              >
                Execute
              </button>
            </div>
            <div>
              <JSONEditor
                readOnly
                value={JSON.stringify(result, null, '\t')}
                showGutter={false}
                highlightActiveLine={false}
                isFixedHeight
              />
            </div>
          </Tabs>
        </section>
        <footer className="modal-card-foot is-justify-content-flex-end">
          <button
            onClick={cancelHandler}
            type="button"
            className="button"
            disabled={isConfirming}
          >
            Cancel
          </button>
        </footer>
      </form>
    </div>
  );
};

export default QueryModal;
