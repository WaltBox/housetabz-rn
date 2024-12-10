import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import TabNavigator from './src/navigation/BottomBar';

const App = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return <TabNavigator />;
};

export default App;
