import React from 'react';
import { Button } from 'components/common/Button/Button';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import CloseIcon from 'components/common/Icons/CloseIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

import * as S from './PreviewModal.styled';
import { PreviewFilter } from './Message';

interface InfoModalProps {
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

  const handleOk = () => {
    if (field === '' || path === '') return;

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

  return (
    <S.PreviewModal>
      {values.map((item) => (
        <div>
          {item.field} : {item.path}{' '}
          <IconButtonWrapper role="button" onClick={() => handleRemove(item)}>
            <CloseIcon />
          </IconButtonWrapper>
        </div>
      ))}
      <div>
        <InputLabel htmlFor="previewFormField">Field</InputLabel>
        <Input
          type="text"
          id="previewFormField"
          min="1"
          value={field}
          onChange={({ target }) => setField(target?.value)}
        />
        <FormError>{field === '' && 'Field is required'}</FormError>
      </div>
      <div>
        <InputLabel htmlFor="previewFormJsonPath">Json path</InputLabel>
        <Input
          type="text"
          id="previewFormJsonPath"
          min="1"
          value={path}
          onChange={({ target }) => setPath(target?.value)}
        />
        <FormError>{path === '' && 'Json path is required'}</FormError>
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
