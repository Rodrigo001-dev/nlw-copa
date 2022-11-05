import { NativeBaseProvider, Center, StatusBar } from 'native-base';
import { 
  useFonts, 
  Roboto_400Regular, 
  Roboto_500Medium, 
  Roboto_700Bold 
} from '@expo-google-fonts/roboto';

import { AuthContextProvider } from './src/contexts/AuthContext';

import { Routes } from './src/routes';
import { Loading } from './src/components/Loading';

import { THEME } from './src/styles/theme';

export default function App() {
  // o fontsLoaded vai me retornar se as fonts já foram carregadas no dispositivo
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        <Center flex={1} bgColor="gray.900">
          <StatusBar 
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          { fontsLoaded ? <Routes /> : <Loading /> }
        </Center>
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}