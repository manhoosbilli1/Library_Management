import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Entry from './components/screens/Entry';

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Entry" component={Entry} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
