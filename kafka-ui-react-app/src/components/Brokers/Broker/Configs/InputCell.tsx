import React, { useEffect } from 'react';
import { CellContext } from '@tanstack/react-table';
import CheckmarkIcon from 'components/common/Icons/CheckmarkIcon';
import EditIcon from 'components/common/Icons/EditIcon';
import CancelIcon from 'components/common/Icons/CancelIcon';
import { useConfirm } from 'lib/hooks/useConfirm';
import { BrokerConfig } from 'generated-sources';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';

import * as S from './Configs.styled';

interface InputCellProps extends CellContext<BrokerConfig, unknown> {
  onUpdate: (name: string, value: string | null) => void;
}

const InputCell: React.FC<InputCellProps> = ({ row, getValue, onUpdate }) => {
  const initialValue = `${getValue<string | number>()}`;
  const [isEdit, setIsEdit] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

  const confirm = useConfirm();

  const onSave = () => {
    if (value !== initialValue) {
      confirm('Are you sure you want to change the value?', async () => {
        onUpdate(row?.original?.name, value || null);
      });
    }
    setIsEdit(false);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return isEdit ? (
    <S.ValueWrapper>
      <Input
        type="text"
        inputSize="S"
        value={value}
        aria-label="inputValue"
        onChange={({ target }) => setValue(target?.value)}
      />
      <S.ButtonsWrapper>
        <Button
          buttonType="primary"
          buttonSize="S"
          aria-label="confirmAction"
          onClick={onSave}
        >
          <CheckmarkIcon /> Save
        </Button>
        <Button
          buttonType="primary"
          buttonSize="S"
          aria-label="cancelAction"
          onClick={() => setIsEdit(false)}
        >
          <CancelIcon /> Cancel
        </Button>
      </S.ButtonsWrapper>
    </S.ValueWrapper>
  ) : (
    <S.ValueWrapper
      style={
        row?.original?.source === 'DYNAMIC_BROKER_CONFIG'
          ? { fontWeight: 600 }
          : { fontWeight: 400 }
      }
    >
      <S.Value>{initialValue}</S.Value>
      <Button
        buttonType="primary"
        buttonSize="S"
        aria-label="editAction"
        onClick={() => setIsEdit(true)}
      >
        <EditIcon /> Edit
      </Button>
    </S.ValueWrapper>
  );
};

export default InputCell;
