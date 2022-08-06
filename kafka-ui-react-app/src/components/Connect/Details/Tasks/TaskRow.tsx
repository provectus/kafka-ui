import React from 'react';
import { Task } from 'generated-sources/models/Task';
import getTagColor from 'components/common/Tag/getTagColor';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import styled from 'styled-components';

import TraceContent from './TraceContent/TraceContent';

const ClickableRow = styled.tr`
  cursor: pointer;
`;

interface TaskRowProps {
  task: Task;
  restartTaskHandler: (id?: number) => void;
}

const MAX_LENGTH = 100;

const TaskRow: React.FC<TaskRowProps> = ({ task, restartTaskHandler }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const truncate = (str: string) => {
    return str.length > MAX_LENGTH
      ? `${str.substring(0, MAX_LENGTH - 3)}...`
      : str;
  };

  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <ClickableRow onClick={toggleIsOpen}>
        <td>
          <IconButtonWrapper aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </td>
        <td>{task.status?.id}</td>
        <td>{task.status?.workerId}</td>
        <td>
          <Tag color={getTagColor(task.status)}>{task.status.state}</Tag>
        </td>
        <td>{truncate(task.status?.trace || '')}</td>
        <td style={{ width: '5%' }}>
          <div>
            <Dropdown>
              <DropdownItem
                onClick={() => restartTaskHandler(task.id?.task)}
                danger
              >
                <span>Restart task</span>
              </DropdownItem>
            </Dropdown>
          </div>
        </td>
      </ClickableRow>
      {isOpen && <TraceContent traceContent={task.status?.trace} />}
    </>
  );
};

export default TaskRow;
