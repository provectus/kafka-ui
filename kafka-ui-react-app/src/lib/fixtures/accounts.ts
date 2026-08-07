import { User } from 'generated-sources';

export const accountsPayload: User[] = [
  { id: 1, username: 'admin', enabled: true, roles: ['memelords'] },
  { id: 2, username: 'viewer', enabled: false, roles: [] },
];
