import React, { useContext, useMemo } from 'react';
import { Row } from '@tanstack/react-table';
import { Action, Topic, UserPermissionResourceEnum } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterName } from 'redux/interfaces';
import { topicKeys, useDeleteTopic } from 'lib/hooks/api/topics';
import { useConfirm } from 'lib/hooks/useConfirm';
import { Button } from 'components/common/Button/Button';
import { useAppDispatch } from 'lib/hooks/redux';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { clusterTopicCopyRelativePath } from 'lib/paths';
import { useQueryClient } from '@tanstack/react-query';
import { ActionCanButton } from 'components/common/ActionComponent';
import { UserInfoRolesAccessContext } from 'components/contexts/UserInfoRolesAccessContext';
import { isPermitted } from 'lib/permissions';

interface BatchActionsbarProps {
  rows: Row<Topic>[];
  resetRowSelection(): void;
}

const BatchActionsbar: React.FC<BatchActionsbarProps> = ({
  rows,
  resetRowSelection,
}) => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const confirm = useConfirm();
  const dispatch = useAppDispatch();
  const deleteTopic = useDeleteTopic(clusterName);
  const selectedTopics = rows.map(({ original }) => original.name);
  const client = useQueryClient();

  const deleteTopicsHandler = () => {
    confirm('Are you sure you want to remove selected topics?', async () => {
      try {
        await Promise.all(
          selectedTopics.map((topicName) => deleteTopic.mutateAsync(topicName))
        );
        resetRowSelection();
      } catch (e) {
        // do nothing;
      }
    });
  };

  const purgeTopicsHandler = () => {
    confirm(
      'Are you sure you want to purge messages of selected topics?',
      async () => {
        try {
          await Promise.all(
            selectedTopics.map((topicName) =>
              dispatch(clearTopicMessages({ clusterName, topicName })).unwrap()
            )
          );
          resetRowSelection();
        } catch (e) {
          // do nothing;
        } finally {
          client.invalidateQueries(topicKeys.all(clusterName));
        }
      }
    );
  };

  type Tuple = [string, string];

  const getCopyTopicPath = () => {
    if (!rows.length) {
      return {
        pathname: '',
        search: '',
      };
    }
    const topic = rows[0].original;

    const search = Object.keys(topic).reduce((acc: Tuple[], key) => {
      const value = topic[key as keyof typeof topic];
      if (!value || key === 'partitions' || key === 'internal') {
        return acc;
      }
      const tuple: Tuple = [key, value.toString()];
      return [...acc, tuple];
    }, []);

    return {
      pathname: clusterTopicCopyRelativePath,
      search: new URLSearchParams(search).toString(),
    };
  };
  const { roles, rbacFlag } = useContext(UserInfoRolesAccessContext);

  const canDeleteSelectedTopics = useMemo(() => {
    return selectedTopics.every((value) =>
      isPermitted({
        roles,
        resource: UserPermissionResourceEnum.TOPIC,
        action: Action.DELETE,
        value,
        clusterName,
        rbacFlag,
      })
    );
  }, [selectedTopics, clusterName, roles]);

  const canPurgeSelectedTopics = useMemo(() => {
    return selectedTopics.every((value) =>
      isPermitted({
        roles,
        resource: UserPermissionResourceEnum.TOPIC,
        action: Action.MESSAGES_DELETE,
        value,
        clusterName,
        rbacFlag,
      })
    );
  }, [selectedTopics, clusterName, roles]);

  return (
    <>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={deleteTopicsHandler}
        disabled={!selectedTopics.length}
        canDoAction={canDeleteSelectedTopics}
      >
        Delete selected topics
      </ActionCanButton>
      <Button
        buttonSize="M"
        buttonType="secondary"
        disabled={selectedTopics.length !== 1}
        to={getCopyTopicPath()}
      >
        Copy selected topic
      </Button>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={purgeTopicsHandler}
        disabled={!selectedTopics.length}
        canDoAction={canPurgeSelectedTopics}
      >
        Purge messages of selected topics
      </ActionCanButton>
    </>
  );
};

export default BatchActionsbar;
