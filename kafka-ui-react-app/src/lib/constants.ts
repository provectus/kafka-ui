export const BASE_PARAMS: RequestInit = {
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const BASE_URL = process.env.REACT_APP_API_URL;

export const TOPIC_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);

export const MILLISECONDS_IN_WEEK = 604_800_000;
export const MILLISECONDS_IN_DAY = 86_400_000;
export const MILLISECONDS_IN_SECOND = 1_000;

export const BYTES_IN_GB = 1_073_741_824;
