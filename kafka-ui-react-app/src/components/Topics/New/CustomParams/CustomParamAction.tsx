import React from 'react';
import CustomParamButton, { CustomParamButtonType } from './CustomParamButton';
import { isFirstParam } from './CustomParams';

interface Props {
  index: string;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRemove: (index: string) => void;
}

const CustomParamAction: React.FC<Props> = ({
  index,
  onAdd,
  onRemove,
}) => (
  <>
    <label className='label'>&nbsp;</label>
    {
      isFirstParam(index)
        ? <CustomParamButton className="is-success" type={CustomParamButtonType.plus} onClick={onAdd} />
        : <CustomParamButton className="is-danger" type={CustomParamButtonType.minus} onClick={() => onRemove(index)} />
    }
  </>
)

export default CustomParamAction;
