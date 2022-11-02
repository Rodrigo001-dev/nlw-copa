import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, Center, Text } from 'native-base';
import { 
  useFonts, 
  Roboto_400Regular, 
  Roboto_500Medium, 
  Roboto_700Bold 
} from '@expo-google-fonts/roboto';

import { THEME } from './src/styles/theme';

export default function App() {
  // o fontsLoaded vai me retornar se as fonts já foram carregadas no dispositivo
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <Center flex={1} bgColor="gray.900">
        <Text color="white" fontSize={24}>
          ola
        </Text>
        <StatusBar style="auto" />
      </Center>
    </NativeBaseProvider>
  );
}