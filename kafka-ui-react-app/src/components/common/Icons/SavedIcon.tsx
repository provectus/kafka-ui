import React, { FC } from 'react';
import { useTheme } from 'styled-components';

const SavedIcon: FC = () => {
  const theme = useTheme();

  return (
    <svg
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill={theme.icons.savedIcon}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 2H2L2 17.9873L7.29945 15.4982C8.3767 14.9922 9.6233 14.9922 10.7005 15.4982L16 17.9873V2ZM2 0C0.895431 0 0 0.895431 0 2V17.9873C0 19.4527 1.5239 20.4206 2.85027 19.7976L8.14973 17.3085C8.68835 17.0555 9.31165 17.0555 9.85027 17.3085L15.1497 19.7976C16.4761 20.4206 18 19.4527 18 17.9873V2C18 0.895431 17.1046 0 16 0H2Z"
        fill={theme.icons.savedIcon}
      />
      <path
        d="M9 4L10.4401 7.01791L13.7553 7.45492L11.3301 9.75709L11.9389 13.0451L9 11.45L6.06107 13.0451L6.66991 9.75709L4.24472 7.45492L7.55993 7.01791L9 4Z"
        fill={theme.icons.savedIcon}
      />
    </svg>
  );
};

export default SavedIcon;
