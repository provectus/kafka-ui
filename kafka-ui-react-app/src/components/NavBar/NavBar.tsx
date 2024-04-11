import React, { useContext, useState, useEffect  } from 'react';
import Select from 'components/common/Select/Select';
import Logo from 'components/common/Logo/Logo';
import Version from 'components/Version/Version';
import GitIcon from 'components/common/Icons/GitIcon';
import DiscordIcon from 'components/common/Icons/DiscordIcon';
import AutoIcon from 'components/common/Icons/AutoIcon';
import SunIcon from 'components/common/Icons/SunIcon';
import MoonIcon from 'components/common/Icons/MoonIcon';
import { ThemeModeContext } from 'components/contexts/ThemeModeContext';

import UserInfo from './UserInfo/UserInfo';
import * as S from './NavBar.styled';
import { preferencesClient as api } from 'lib/api';

interface Props {
  onBurgerClick: () => void;
}

export type ThemeDropDownValue = 'auto_theme' | 'light_theme' | 'dark_theme';

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

const NavBar: React.FC<Props> = ({ onBurgerClick }) => {
  const { themeMode, setThemeMode } = useContext(ThemeModeContext);
  const [appName, setAppName] = useState<string>("");
  const [showGitHubLink, setShowGitHubLink] = useState<boolean>(true);
  const [showDiscordLink, setShowDiscordLink] = useState<boolean>(true);
  const [showVersion, setShowVersion] = useState<boolean>(true);
  const [logoBase64, setLogoBase64] = useState<string>("");


  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const preferencesData = await api.getPreferences();
        setAppName(preferencesData.appName);
        setShowGitHubLink(preferencesData.removeGitLink);
        setShowDiscordLink(preferencesData.removeDiscordLink);
        setShowVersion(preferencesData.version);
        if (preferencesData.logo) {
          setLogoBase64(preferencesData.logo);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, []);

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
            {logoBase64 ? (
              <img src={logoBase64} alt="Logo" />
            ) : (
              <Logo />
            )}
            {appName ? (
              <span>{appName}</span>
            ) : (
              "UI for Apache Kafka"
            )}
          </S.Hyperlink>
          {showVersion && (
          <S.NavbarItem>
            <Version />
          </S.NavbarItem>
          )}
        </S.NavbarBrand>
      </S.NavbarBrand>
      <S.NavbarSocial>
        <Select
          options={options}
          value={themeMode}
          onChange={setThemeMode}
          isThemeMode
        />
        {showGitHubLink && (
          <S.SocialLink
            href="https://github.com/provectus/kafka-ui"
            target="_blank"
          >
            <GitIcon />
          </S.SocialLink>
        )}
        {showDiscordLink && (
        <S.SocialLink
          href="https://discord.com/invite/4DWzD7pGE5"
          target="_blank"
        >
          <DiscordIcon />
        </S.SocialLink>
        )}
        <UserInfo />
      </S.NavbarSocial>
    </S.Navbar>
  );
};

export default NavBar;
