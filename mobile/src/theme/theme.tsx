import React, { ReactNode, createContext, useContext } from 'react';

export const theme = {
  colors: {
    background: '#F5F5F5', // Fundo claro
    primary: '#000000', // Texto principal preto (mantido)
    secondary: '#E53935', // Vermelho vibrante da chama
    accent: '#FF7043', // Laranja para elementos complementares
    muted: '#757575', // Cinza para texto secundário
    //highlight: '#B71C1C', // Vermelho escuro para destaques
    highlight: '#000', // Vermelho escuro para destaques
    card: '#FFFFFF', // Cartões brancos (mantido)
  },
  fonts: {
    regular: 'System',
    bold: 'System',
  },
};


export const ThemeContext = createContext(theme);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}; 