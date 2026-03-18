import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// Импортируем ваши экраны
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateBtnPasswordScreen from '../screens/CreateBtnPasswordScreen';
import LoginPasswordScreen from '../screens/LoginPasswordScreen';
import CreateTextPasswordScreen from '../screens/CreateTextPasswordScreen';

const Stack = createNativeStackNavigator();

// Компонент для проверки токена при запуске
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      // Проверяем наличие токена в AsyncStorage
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userToken) {
        // Если токен есть, проверяем наличие пароля
        const userPassword = await AsyncStorage.getItem('userPassword');
        
        if (userPassword) {
          // Если есть и токен и пароль, отправляем на экран ввода пароля
          setInitialRoute('LoginPassword');
        } else {
          // Если есть токен, но нет пароля, отправляем на создание пароля
          setInitialRoute('CreatePassword');
        }
      } else {
        // Если токена нет, отправляем на экран входа
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#1A6FEE" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreatePassword" component={CreateBtnPasswordScreen} />
      <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
      <Stack.Screen name="CreateTextPassword" component={CreateTextPasswordScreen} />
    </Stack.Navigator>
  );
}