import {
  KafkaAcl,
  KafkaAclResourceType,
  KafkaAclNamePatternType,
  KafkaAclPermissionEnum,
  KafkaAclOperationEnum,
} from 'generated-sources';

export const aclPayload: KafkaAcl[] = [
  {
    principal: 'User 1',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceType.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternType.LITERAL,
    permission: KafkaAclPermissionEnum.ALLOW,
    operation: KafkaAclOperationEnum.READ,
  },
  {
    principal: 'User 2',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceType.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternType.PREFIXED,
    permission: KafkaAclPermissionEnum.ALLOW,
    operation: KafkaAclOperationEnum.READ,
  },
  {
    principal: 'User 3',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceType.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternType.LITERAL,
    permission: KafkaAclPermissionEnum.DENY,
    operation: KafkaAclOperationEnum.READ,
  },
];
