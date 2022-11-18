import React from 'react';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import UserIcon from 'components/common/Icons/UserIcon';
import DropdownArrowIcon from 'components/common/Icons/DropdownArrowIcon';
import { useTheme } from 'styled-components';
import { useUserInfo } from 'lib/hooks/useUserInfo';

import * as S from './UserInfo.styled';

const UserInfo = () => {
  const { username } = useUserInfo();
  const theme = useTheme();

  return (
    <Dropdown
      label={
        <S.Wrapper>
          <UserIcon />
          <S.Text>{username}</S.Text>
          <DropdownArrowIcon
            isOpen={false}
            style={{}}
            color={theme.button.primary.invertedColors.normal}
          />
        </S.Wrapper>
      }
    >
      <DropdownItem>
        <S.LogoutLink href="/logout">Log out</S.LogoutLink>
      </DropdownItem>
    </Dropdown>
  );
};

export default UserInfo;
