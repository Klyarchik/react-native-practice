import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем все иконки
import HomeIcon from '../../assets/Image/main.svg';
import HomeActiveIcon from '../../assets/Image/mainActive.svg';
import CatalogIcon from '../../assets/Image/catalog.svg';
import CatalogActiveIcon from '../../assets/Image/catalogActive.svg';
import ProjectIcon from '../../assets/Image/project.svg';
import ProjectActiveIcon from '../../assets/Image/projectActive.svg';
import ProfileIcon from '../../assets/Image/profile.svg';
import ProfileActiveIcon from '../../assets/Image/profileActive.svg';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'home', 'catalog', 'project', 'profile'

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        `http://2.nntc.nnov.ru:8900/api/collections/users/records/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        },
      );

      const data = await response.json();
      const firstName = data.first_name;
      const email = data.email;

      setUserName(firstName);
      setUserEmail(email);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Login');
      console.log("Локальное хранилище было очищено");
    } catch (error) {
      Alert.alert("Что-то пошло не так при очистке данных");
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  // Функция для отображения правильной иконки
  const renderIcon = (tabName) => {
    const iconProps = {
      width: 76,
      height: 49,
    };

    switch (tabName) {
      case 'home':
        return activeTab === 'home' ? 
          <HomeActiveIcon {...iconProps} /> : 
          <HomeIcon {...iconProps} />;
      case 'catalog':
        return activeTab === 'catalog' ? 
          <CatalogActiveIcon {...iconProps} /> : 
          <CatalogIcon {...iconProps} />;
      case 'project':
        return activeTab === 'project' ? 
          <ProjectActiveIcon {...iconProps} /> : 
          <ProjectIcon {...iconProps} />;
      case 'profile':
        return activeTab === 'profile' ? 
          <ProfileActiveIcon {...iconProps} /> : 
          <ProfileIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    return (
      <>
        {/* Верхняя часть с именем и почтой */}
        <View style={styles.headerSection}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Кнопка Мои заказы */}
        <TouchableOpacity style={styles.ordersButton}>
          <Text style={styles.ordersButtonText}>Мои заказы</Text>
        </TouchableOpacity>

        {/* Уведомления с переключателем */}
        <View style={styles.notificationsSection}>
          <Text style={styles.notificationsText}>Уведомления</Text>
          <Switch
            trackColor={{ false: "#E5E5E5", true: "#1A6FEE" }}
            thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#E5E5E5"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        {/* Юридическая информация */}
        <View style={styles.legalSection}>
          <TouchableOpacity>
            <Text style={styles.legalText}>Политика конфиденциальности</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Пользовательское соглашение</Text>
          </TouchableOpacity>
        </View>

        {/* Красная кнопка выхода */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={clearAsyncStorage}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Выход</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: 0,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {/* Основной контент */}
        <View style={styles.mainContent}>
          {renderTabContent()}
        </View>

        {/* Нижняя навигация (4 вкладки) - ТОЛЬКО ИКОНКИ, БЕЗ ТЕКСТА */}
        <View style={[styles.bottomNavigation, { paddingBottom: insets.bottom }]}>
          {/* Главная */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('home')}
          >
            {renderIcon('home')}
          </TouchableOpacity>

          {/* Каталог */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('catalog')}
          >
            {renderIcon('catalog')}
          </TouchableOpacity>

          {/* Проекты */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('project')}
          >
            {renderIcon('project')}
          </TouchableOpacity>

          {/* Профиль */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => setActiveTab('profile')}
          >
            {renderIcon('profile')}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#939396',
  },
  ordersButton: {
    backgroundColor: '#F5F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  ordersButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  notificationsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 24,
  },
  notificationsText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '500',
  },
  legalSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  legalLink: {
    marginTop: 12,
  },
  legalText: {
    fontSize: 15,
    color: '#939396',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 16,
    marginBottom: 24,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#FD3535',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 17,
  },
  // Стили для нижней навигации
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
});