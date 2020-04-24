import React from 'react';
import CustomParamButton, { CustomParamButtonType } from './CustomParamButton';

interface Props {
  index: string;
  onRemove: (index: string) => void;
}

const CustomParamAction: React.FC<Props> = ({ index, onRemove }) => (
  <>
    <label className="label">&nbsp;</label>
    <CustomParamButton
      className="is-danger"
      type={CustomParamButtonType.minus}
      onClick={() => onRemove(index)}
    />
  </>
);

export default CustomParamAction;
