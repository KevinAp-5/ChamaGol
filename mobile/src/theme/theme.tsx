import React, { ReactNode, createContext, useContext } from 'react';
import { useFonts } from 'expo-font';

export const theme = {
  colors: {
    background: '#FFFFFF', // Fundo branco mais limpo
    primary: '#000000', // Preto principal
    secondary: '#E53935', // Vermelho vibrante da chama (mantido)
    accent: '#FF5722', // Laranja mais intenso para elementos complementares
    muted: '#757575', // Cinza para texto secundário (mantido)
    highlight: '#B71C1C', // Vermelho escuro para destaques (restaurado)
    card: '#FFFFFF', // Cartões brancos (mantido)
    error: "#FF3B30", // Vermelho de erro mais moderno
    success: "#34C759", // Verde para feedback positivo
    shadow: 'rgba(0, 0, 0, 0.1)', // Cor para sombras
    divider: '#E0E0E0', // Cor para divisores
    overlay: 'rgba(0, 0, 0, 0.7)', // Cor para overlays
    white: "#FFF",
  },
  fonts: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extraBold: 'Montserrat-ExtraBold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  animation: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
};

export const ThemeContext = createContext(theme);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Carregar fontes
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-ExtraBold': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
  });

  // Usar fontes de sistema enquanto as fontes personalizadas estão carregando
  const currentTheme = {
    ...theme,
    fonts: fontsLoaded
      ? theme.fonts
      : {
          regular: 'System',
          medium: 'System',
          semibold: 'System',
          bold: 'System',
          extraBold: 'System',
        },
  };

  return (
    <ThemeContext.Provider value={currentTheme}>{children}</ThemeContext.Provider>
  );
};