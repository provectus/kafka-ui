import React from 'react';
import Select from 'components/common/Select/Select';
import Logo from 'components/common/Logo/Logo';
import Version from 'components/Version/Version';
import GitIcon from 'components/common/Icons/GitIcon';
import DiscordIcon from 'components/common/Icons/DiscordIcon';
import AutoIcon from 'components/common/Icons/AutoIcon';
import SunIcon from 'components/common/Icons/SunIcon';
import MoonIcon from 'components/common/Icons/MoonIcon';

import UserInfo from './UserInfo/UserInfo';
import * as S from './NavBar.styled';

interface Props {
  onBurgerClick: () => void;
  setDarkMode: (value: boolean) => void;
}

type ThemeDropDownValue = 'auto_theme' | 'light_theme' | 'dark_theme';

const options = [
  {
    label: (
      <>
        <AutoIcon />
        <div>Auto theme</div>
      </>
    ),
    value: 'auto_theme',
  },
  {
    label: (
      <>
        <SunIcon />
        <div>Light theme</div>
      </>
    ),
    value: 'light_theme',
  },
  {
    label: (
      <>
        <MoonIcon />
        <div>Dark theme</div>
      </>
    ),
    value: 'dark_theme',
  },
];

const NavBar: React.FC<Props> = ({ onBurgerClick, setDarkMode }) => {
  const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = React.useState<ThemeDropDownValue>();

  React.useLayoutEffect(() => {
    const mode = localStorage.getItem('mode');
    if (mode) {
      setThemeMode(mode as ThemeDropDownValue);
      if (mode === 'auto_theme') {
        setDarkMode(matchDark.matches);
      } else if (mode === 'light_theme') {
        setDarkMode(false);
      } else if (mode === 'dark_theme') {
        setDarkMode(true);
      }
    } else {
      setThemeMode('auto_theme');
    }
  }, []);

  React.useEffect(() => {
    if (themeMode === 'auto_theme') {
      setDarkMode(matchDark.matches);
      matchDark.addListener((e) => {
        setDarkMode(e.matches);
      });
    }
  }, [matchDark, themeMode]);

  const onChangeThemeMode = (value: string | number) => {
    setThemeMode(value as ThemeDropDownValue);
    localStorage.setItem('mode', value as string);
    if (value === 'light_theme') {
      setDarkMode(false);
    } else if (value === 'dark_theme') {
      setDarkMode(true);
    }
  };

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
        <Select
          options={options}
          value={themeMode}
          onChange={onChangeThemeMode}
          isThemeMode
        />
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
        <UserInfo />
      </S.NavbarSocial>
    </S.Navbar>
  );
};

export default NavBar;
