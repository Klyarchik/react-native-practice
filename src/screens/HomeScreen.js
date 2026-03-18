import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSwitch from '../components/CustomSwitch';

// Импортируем иконки (замените на PNG или используйте текстовые иконки)
import HomeIcon from '../../assets/Image/main.svg';
import HomeActiveIcon from '../../assets/Image/mainActive.svg';
import CatalogIcon from '../../assets/Image/catalog.svg';
import CatalogActiveIcon from '../../assets/Image/catalogActive.svg';
import ProjectIcon from '../../assets/Image/project.svg';
import ProjectActiveIcon from '../../assets/Image/projectActive.svg';
import ProfileIcon from '../../assets/Image/profile.svg';
import ProfileActiveIcon from '../../assets/Image/profileActive.svg';

// ============ МАЛЕНЬКИЕ КОМПОНЕНТЫ ДЛЯ КАЖДОЙ ВКЛАДКИ ============

// Компонент для главной страницы
const HomeContent = ({ userName, userEmail }) => (
  <View style={styles.contentContainer}>
    <View style={styles.headerSection}>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Популярные проекты</Text>
      <Text style={styles.cardText}>Здесь будут отображаться популярные проекты</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Рекомендации</Text>
      <Text style={styles.cardText}>Персонализированные рекомендации для вас</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Новинки</Text>
      <Text style={styles.cardText}>Свежие проекты и обновления</Text>
    </View>
  </View>
);

// Компонент для каталога
const CatalogContent = () => (
  <View style={styles.centerContent}>
    <Text style={styles.bigEmoji}>📋</Text>
    <Text style={styles.title}>Каталог</Text>
    <Text style={styles.subtitle}>Здесь будет каталог проектов</Text>
  </View>
);

// Компонент для проектов
const ProjectContent = () => (
  <View style={styles.centerContent}>
    <Text style={styles.bigEmoji}>📁</Text>
    <Text style={styles.title}>Проекты</Text>
    <Text style={styles.subtitle}>Здесь будут ваши проекты</Text>
  </View>
);

// Компонент для профиля
const ProfileContent = ({ userName, userEmail, notificationsEnabled, toggleNotifications, clearAsyncStorage }) => (
  <View style={styles.contentContainer}>
    <View style={styles.headerSection}>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
    </View>

    {/* Кнопка Мои заказы */}
    <TouchableOpacity style={styles.ordersButton}>
      <Image 
        source={require('../../assets/Image/notebook.png')} 
        style={styles.ordersButtonIcon}
      />
      <Text style={styles.ordersButtonText}>Мои заказы</Text>
    </TouchableOpacity>

    {/* Секция уведомлений */}
    <View style={styles.notificationsContainer}>
      <View style={styles.notificationsLeftContainer}>
        <Image 
          source={require('../../assets/Image/settings.png')} 
          style={styles.notificationsIcon}
        />
        <Text style={styles.notificationsText}>Уведомления</Text>
      </View>
      <CustomSwitch 
        value={notificationsEnabled}
        onValueChange={toggleNotifications}
      />
    </View>

    {/* Блок с юридической информацией и выходом */}
    <View style={styles.bottomBlock}>
      <TouchableOpacity>
        <Text style={styles.legalText}>Политика конфиденциальности</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.legalLink}>
        <Text style={styles.legalText}>Пользовательское соглашение</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={clearAsyncStorage}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutButtonText}>Выход</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ============ ОСНОВНОЙ КОМПОНЕНТ ============

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadUserData();
    loadNotificationSetting(); // 👈 Загружаем настройку уведомлений
  }, []);

  // Загрузка данных пользователя
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
      setUserName(data.first_name);
      setUserEmail(data.email);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  // 👇 НОВАЯ ФУНКЦИЯ: Загрузка настройки уведомлений
  const loadNotificationSetting = async () => {
    try {
      const savedNotificationSetting = await AsyncStorage.getItem('notificationsEnabled');
      if (savedNotificationSetting !== null) {
        setNotificationsEnabled(JSON.parse(savedNotificationSetting));
      }
    } catch (error) {
      console.error('Ошибка загрузки настройки уведомлений:', error);
    }
  };

  // 👇 НОВАЯ ФУНКЦИЯ: Сохранение настройки уведомлений
  const saveNotificationSetting = async (value) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Ошибка сохранения настройки уведомлений:', error);
    }
  };

  // Обновленная функция переключения уведомлений
  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => {
      const newState = !previousState;
      saveNotificationSetting(newState); // 👈 Сохраняем новое состояние
      return newState;
    });
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Что-то пошло не так при очистке данных");
    }
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

  // Рендерим активный компонент
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent userName={userName} userEmail={userEmail} />;
      case 'catalog':
        return <CatalogContent />;
      case 'project':
        return <ProjectContent />;
      case 'profile':
        return <ProfileContent 
          userName={userName} 
          userEmail={userEmail}
          notificationsEnabled={notificationsEnabled}
          toggleNotifications={toggleNotifications}
          clearAsyncStorage={clearAsyncStorage}
        />;
      default:
        return <HomeContent userName={userName} userEmail={userEmail} />;
    }
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
      {/* Основной контент */}
      <View style={styles.mainContent}>
        {renderActiveContent()}
      </View>

      {/* Нижняя навигация */}
      <View style={[styles.bottomNavigation, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          {renderIcon('home')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => setActiveTab('catalog')}
        >
          {renderIcon('catalog')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => setActiveTab('project')}
        >
          {renderIcon('project')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
        >
          {renderIcon('profile')}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#939396',
    textAlign: 'center',
  },
  bigEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#F5F5F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#939396',
    lineHeight: 20,
  },
  ordersButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row', // Добавлено для расположения иконки и текста в ряд
  },
  ordersButtonIcon: {
    width: 32,
    height: 32,
    marginRight: 20, // Отступ между иконкой и текстом
    resizeMode: 'contain',
  },
  ordersButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    
  },
  // Добавьте этот стиль в объект styles
  notificationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24
    // ПОЛОСЫ УБРАНЫ! Только отступы
  },
  notificationsLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationsIcon: {
    width: 32,
    height: 32,
    marginRight: 20,
    resizeMode: 'contain',
  },
  notificationsText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '600',
  },
  bottomBlock: {
    alignItems: 'center',
    marginTop: 122, // Отступ сверху от предыдущего контента
  },
  legalLink: {
    marginTop: 24, // Междустрочный интервал 24px
  },
  legalText: {
    fontSize: 15,
    fontWeight: '500',
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
    fontWeight: '500',
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
    paddingBottom: 15
  },
});