import React from 'react';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import UserIcon from 'components/common/Icons/UserIcon';
import DropdownArrowIcon from 'components/common/Icons/DropdownArrowIcon';
import { useUserInfo } from 'lib/hooks/useUserInfo';

import * as S from './UserInfo.styled';

const UserInfo = () => {
  const { username, roles } = useUserInfo();

  const roleNames = roles
    ? Array.from(roles.values())
        .map((value) => {
          const types = Array.from(value.values()).map((r) => r);
          const names = new Set(
            types.map((u) => u.map((a) => a.roleName)).flat()
          );

          return Array.from(names);
        })
        .flat()
    : [];

  return username ? (
    <Dropdown
      label={
        <S.Wrapper>
          <UserIcon />
          <S.LinkText>{username}</S.LinkText>
          <DropdownArrowIcon isOpen={false} />
        </S.Wrapper>
      }
    >
      {roleNames.length > 0 && (
        <>
          <DropdownItem>
            <S.HeaderText>Assigned roles</S.HeaderText>
          </DropdownItem>

          {roleNames.map((name) => (
            <DropdownItem key={name}>
              <S.Text>{name}</S.Text>
            </DropdownItem>
          ))}

          <DropdownItem>
            <hr />
          </DropdownItem>
        </>
      )}

      <DropdownItem href={`${window.basePath}/logout`}>
        <S.LogoutLink>Log out</S.LogoutLink>
      </DropdownItem>
    </Dropdown>
  ) : null;
};

export default UserInfo;
