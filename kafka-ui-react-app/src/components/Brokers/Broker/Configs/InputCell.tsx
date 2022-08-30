import React from 'react';
import { CellContext } from '@tanstack/react-table';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import CheckmarkIcon from 'components/common/Icons/CheckmarkIcon';
import EditIcon from 'components/common/Icons/EditIcon';
import CancelIcon from 'components/common/Icons/CancelIcon';
import { useConfirm } from 'lib/hooks/useConfirm';
import { BrokerConfig } from 'generated-sources';

interface InputCellProps extends CellContext<BrokerConfig, unknown> {
  onUpdate: (name: string, value: string) => void;
}

const InputCell: React.FC<InputCellProps> = ({ row, getValue, onUpdate }) => {
  const initialValue = `${getValue<string | number>()}`;
  const [isEdit, setIsEdit] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

  const confirm = useConfirm();

  const onSave = () => {
    if (value !== initialValue) {
      confirm(<>Are you sure you want to change the value?</>, async () => {
        onUpdate(row?.original?.name, value);
      });
    }
    setIsEdit(false);
  };

  return isEdit ? (
    <>
      <input value={value} onChange={({ target }) => setValue(target?.value)} />
      <IconButtonWrapper aria-label="confirmAction" onClick={onSave}>
        <CheckmarkIcon /> <ConfirmationModal />
      </IconButtonWrapper>{' '}
      <IconButtonWrapper
        aria-label="cancelAction"
        onClick={() => setIsEdit(false)}
      >
        <CancelIcon />
      </IconButtonWrapper>
    </>
  ) : (
    <span>
      {value}{' '}
      <IconButtonWrapper
        aria-label="editAction"
        onClick={() => setIsEdit(true)}
      >
        <EditIcon />
      </IconButtonWrapper>
    </span>
  );
};

export default InputCell;
