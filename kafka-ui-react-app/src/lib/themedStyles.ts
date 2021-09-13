import baseStyled, {
  useTheme as baseUseTheme,
  ThemedStyledInterface,
} from 'styled-components';
import theme from 'theme/theme';

type ThemeInterface = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<ThemeInterface>;
export const useTheme = () => baseUseTheme() as ThemeInterface;
