import React, { useEffect, useState } from 'react';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Broker } from 'generated-sources';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';

interface IProps {
  brokerId: number | string;
  brokerItem?: Broker;
  segmentSize?: number;
  segmentCount?: number;
}

export const BrokersTableRow: React.FC<IProps> = ({
  brokerId,
  segmentSize,
  segmentCount,
  brokerItem,
}) => {
  const [isOpenDirLog, setIsOpenDirLog] = useState<boolean>(false);
  const toggleIsOpen = () => setIsOpenDirLog((c) => !c);

  return (
    <>
      <tr key={brokerId}>
        <td style={{ width: '3%' }}>
          <IconButtonWrapper onClick={toggleIsOpen}>
            <MessageToggleIcon isOpen={isOpenDirLog} />
          </IconButtonWrapper>
        </td>

        <td>{brokerId}</td>
        <td>
          <BytesFormatted value={segmentSize} />
        </td>
        <td>{segmentCount}</td>
        <td>{brokerItem?.port}</td>
        <td>{brokerItem?.host}</td>
      </tr>
      {isOpenDirLog && <div>open</div>}
    </>
  );
};
