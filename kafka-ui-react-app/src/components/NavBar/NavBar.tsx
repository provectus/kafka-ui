import React from 'react';
import Logo from 'components/common/Logo/Logo';
import Version from 'components/Version/Version';
import GitIcon from 'components/common/Icons/GitIcon';
import DiscordIcon from 'components/common/Icons/DiscordIcon';

import * as S from './NavBar.styled';

interface Props {
  onBurgerClick: () => void;
}

const NavBar: React.FC<Props> = ({ onBurgerClick }) => {
  return (
    <S.Navbar role="navigation" aria-label="Page Header">
      <S.NavbarBrand>
        <S.NavbarBrand>
          <S.NavbarBurger
            onClick={onBurgerClick}
            onKeyDown={onBurgerClick}
            role="button"
            tabIndex={0}
            aria-label="burger"
          >
            <S.Span role="separator" />
            <S.Span role="separator" />
            <S.Span role="separator" />
          </S.NavbarBurger>

          <S.Hyperlink to="/">
            <Logo />
            UI for Apache Kafka
          </S.Hyperlink>

          <S.NavbarItem>
            <Version />
          </S.NavbarItem>
        </S.NavbarBrand>
      </S.NavbarBrand>
      <S.NavbarSocial>
        <S.LogoutLink href="/logout">
          <S.LogoutButton buttonType="primary" buttonSize="M">
            Log out
          </S.LogoutButton>
        </S.LogoutLink>
        <S.SocialLink
          href="https://github.com/provectus/kafka-ui"
          target="_blank"
        >
          <GitIcon />
        </S.SocialLink>
        <S.SocialLink
          href="https://discord.com/invite/4DWzD7pGE5"
          target="_blank"
        >
          <DiscordIcon />
        </S.SocialLink>
      </S.NavbarSocial>
    </S.Navbar>
  );
};

export default NavBar;
