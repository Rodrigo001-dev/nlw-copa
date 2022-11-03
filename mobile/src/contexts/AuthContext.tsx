import { createContext, ReactNode } from "react";

interface UserProps {
  name: string;
  avatarUrl: string;
};

export interface AuthContextDataProps {
  user: UserProps;
  signIn: () => Promise<void>;
};

interface AuthProviderProps {
  children: ReactNode;
};

// o AuthContext vai armazenar o nosso contexto, o conteudo do nosso contexto
export const AuthContext = createContext({} as AuthContextDataProps);

// o AuthContextProvider vai permitir que seja compartilhado o nosso contexto com
// toda a nossa aplicação
export function AuthContextProvider({ children }: AuthProviderProps) {
  async function signIn() {
    console.log('Vamos logar!');
  };

  return (
    <AuthContext.Provider value={{
      signIn,
      user: {
        name: 'Rodrigo',
        avatarUrl: 'https://github.com/Rodrigo001-dev.png'
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
};