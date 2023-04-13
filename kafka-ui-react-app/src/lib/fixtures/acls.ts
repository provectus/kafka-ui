import {
  KafkaAcl,
  KafkaAclResourceTypeEnum,
  KafkaAclNamePatternTypeEnum,
  KafkaAclPermissionEnum,
  KafkaAclOperationEnum,
} from 'generated-sources';

export const aclPayload: KafkaAcl[] = [
  {
    principal: 'User 1',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceTypeEnum.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternTypeEnum.LITERAL,
    permission: KafkaAclPermissionEnum.ALLOW,
    operation: KafkaAclOperationEnum.READ,
  },
  {
    principal: 'User 2',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceTypeEnum.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternTypeEnum.PREFIXED,
    permission: KafkaAclPermissionEnum.ALLOW,
    operation: KafkaAclOperationEnum.READ,
  },
  {
    principal: 'User 3',
    resourceName: 'Topic',
    resourceType: KafkaAclResourceTypeEnum.TOPIC,
    host: '_host1',
    namePatternType: KafkaAclNamePatternTypeEnum.LITERAL,
    permission: KafkaAclPermissionEnum.DENY,
    operation: KafkaAclOperationEnum.READ,
  },
];
