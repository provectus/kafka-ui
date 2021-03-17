import { ConfigurationParameters } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: process.env.REACT_APP_API_URL || '',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const TOPIC_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);
export const SCHEMA_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);

export const MILLISECONDS_IN_WEEK = 604_800_000;
export const MILLISECONDS_IN_DAY = 86_400_000;
export const MILLISECONDS_IN_SECOND = 1_000;

export const BYTES_IN_GB = 1_073_741_824;

export const PER_PAGE = 25;
