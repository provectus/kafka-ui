import React from 'react';
import { Button } from 'components/common/Button/Button';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import EditIcon from 'components/common/Icons/EditIcon';
import CancelIcon from 'components/common/Icons/CancelIcon';

import * as S from './PreviewModal.styled';
import { PreviewFilter } from './Message';

export interface InfoModalProps {
  values: PreviewFilter[];
  toggleIsOpen(): void;
  setFilters: (payload: PreviewFilter[]) => void;
}

const PreviewModal: React.FC<InfoModalProps> = ({
  values,
  toggleIsOpen,
  setFilters,
}) => {
  const [field, setField] = React.useState('');
  const [path, setPath] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleOk = () => {
    const newErrors = [];

    if (field === '') {
      newErrors.push('field');
    }

    if (path === '') {
      newErrors.push('path');
    }

    if (newErrors?.length) {
      setErrors(newErrors);
      return;
    }

    const newValues = [...values, { field, path }];
    setFilters(newValues);
    toggleIsOpen();
  };

  const handleRemove = (filter: PreviewFilter) => {
    const newValues = values.filter(
      (item) => item.field !== filter.field && item.path !== filter.path
    );

    setFilters(newValues);
  };

  const handleEdit = (filter: PreviewFilter) => {
    setField(filter.field);
    setPath(filter.path);
    const newValues = values.filter(
      (item) => item.field !== filter.field && item.path !== filter.path
    );
    setFilters(newValues);
  };

  return (
    <S.PreviewModal>
      {values.map((item) => (
        <S.PreviewValues>
          {item.field} : {item.path}{' '}
          <IconButtonWrapper role="button" onClick={() => handleEdit(item)}>
            <EditIcon />
          </IconButtonWrapper>
          {'  '}
          <IconButtonWrapper role="button" onClick={() => handleRemove(item)}>
            <CancelIcon />
          </IconButtonWrapper>
        </S.PreviewValues>
      ))}
      <div>
        <InputLabel htmlFor="previewFormField">Field</InputLabel>
        <Input
          type="text"
          id="previewFormField"
          min="1"
          value={field}
          placeholder="Field"
          onChange={({ target }) => setField(target?.value)}
        />
        <FormError>{errors.includes('field') && 'Field is required'}</FormError>
      </div>
      <div>
        <InputLabel htmlFor="previewFormJsonPath">Json path</InputLabel>
        <Input
          type="text"
          id="previewFormJsonPath"
          min="1"
          value={path}
          placeholder="Json Path"
          onChange={({ target }) => setPath(target?.value)}
        />
        <FormError>
          {errors.includes('path') && 'Json path is required'}
        </FormError>
      </div>
      <S.ButtonWrapper>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={toggleIsOpen}
        >
          Cancel
        </Button>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={handleOk}
        >
          Ok
        </Button>
      </S.ButtonWrapper>
    </S.PreviewModal>
  );
};

export default PreviewModal;
