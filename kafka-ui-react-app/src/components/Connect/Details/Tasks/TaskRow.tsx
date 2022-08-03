import React from 'react';
import { Task } from 'generated-sources/models/Task';
import getTagColor from 'components/common/Tag/getTagColor';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

import { Cell } from './TaskRow.styled';

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

  return (
    <tr key={task.status?.id} onClick={() => setIsOpen(!isOpen)}>
      <Cell>
        {task.status.trace && task.status.trace.length > MAX_LENGTH && (
          <IconButtonWrapper onClick={() => setIsOpen(!isOpen)} aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        )}
      </Cell>
      <Cell>{task.status?.id}</Cell>
      <Cell>{task.status?.workerId}</Cell>
      <Cell>
        <Tag color={getTagColor(task.status)}>{task.status.state}</Tag>
      </Cell>
      <Cell>
        {isOpen ? task.status?.trace : truncate(task.status?.trace || '')}
      </Cell>
      <Cell style={{ width: '5%' }}>
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
      </Cell>
    </tr>
  );
};

export default TaskRow;
