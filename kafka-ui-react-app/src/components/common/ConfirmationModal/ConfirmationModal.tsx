import React from 'react';
import { Button } from 'components/common/Button/Button';
import { ConfirmContext } from 'components/contexts/ConfirmContext';

import * as S from './ConfirmationModal.styled';

const ConfirmationModal: React.FC = () => {
  const context = React.useContext(ConfirmContext);
  const isOpen = context?.content && context?.confirm;

  if (!isOpen) return null;

  return (
    <S.Wrapper role="dialog" aria-label="Confirmation Dialog">
      <S.Overlay onClick={context.cancel} aria-hidden="true" role="button" />
      <S.Modal>
        <S.Header>Confirm the action</S.Header>
        <S.Content>{context.content}</S.Content>
        <S.Footer>
          <Button
            buttonType="secondary"
            buttonSize="M"
            onClick={context.cancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            buttonType={context.dangerButton ? 'danger' : 'primary'}
            buttonSize="M"
            onClick={context.confirm}
            type="button"
          >
            Confirm
          </Button>
        </S.Footer>
      </S.Modal>
    </S.Wrapper>
  );
};

export default ConfirmationModal;
