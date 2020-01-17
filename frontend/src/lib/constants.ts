export const BASE_PARAMS: RequestInit = {
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const BASE_URL = 'http://localhost:3004';

export const TOPIC_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);
export const MILLISECONDS_IN_DAY = 86_400_000;
export const BYTES_IN_GB = 1_073_741_824;
