import React from 'react';
import CustomParamButton from './CustomParamButton';
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
        ? <CustomParamButton btnColor="is-success" btnIcon='fa-plus' onClick={onAdd} />
        : <CustomParamButton btnColor="is-danger" btnIcon='fa-minus' onClick={() => onRemove(index)} />
    }
  </>
)

export default CustomParamAction;
