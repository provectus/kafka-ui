import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SCHEMA_NAME_VALIDATION_PATTERN } from 'lib/constants';
import { SchemaName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';

interface Props {
  subject?: SchemaName;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

const SchemaForm: React.FC<Props> = ({
  subject,
  isEditing,
  isSubmitting,
  onSubmit,
}) => {
  const { register, errors, formState } = useFormContext();

  return (
    <form onSubmit={onSubmit}>
      <div>
        <div>
          <label className="label">Subject *</label>
          <input
            className="input"
            placeholder="Schema Name"
            ref={register({
              required: 'Topic Name is required.',
              pattern: {
                value: SCHEMA_NAME_VALIDATION_PATTERN,
                message: 'Only alphanumeric, _, -, and . allowed',
              },
            })}
            defaultValue={subject}
            name="subject"
            autoComplete="off"
            disabled={isEditing || isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="subject" />
          </p>
        </div>

        <div>
          <label className="label">Schema *</label>
          <textarea
            ref={register}
            name="schema"
            disabled={isEditing || isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="schema" />
          </p>
        </div>
      </div>

      <input
        type="submit"
        className="button is-primary"
        disabled={isSubmitting}
      />
    </form>
  );
};

export default SchemaForm;
