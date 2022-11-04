import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
  name: string;
  avatarUrl: string;
};

export interface AuthContextDataProps {
  user: UserProps;
  isUserLoading: boolean;
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
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // a função promptAsync vai permitir que eu inicie o fluxo de autenticação
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '864229404258-r7fcmbfs0c9aase0f0luqst05o7gnbk0.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  });

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  };

  async function signInWithGoogle(access_token: string) {
    console.log("TOKEN DE AUTENTICAÇÃO", access_token);
  };

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken);
    }; 
  }, [response]);

  return (
    <AuthContext.Provider value={{
      signIn,
      isUserLoading,
      user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};