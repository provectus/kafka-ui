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
];
