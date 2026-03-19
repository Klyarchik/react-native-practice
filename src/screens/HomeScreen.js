import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
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
import Banner1 from '../../assets/Image/banner1.svg'
import Banner2 from '../../assets/Image/banner2.svg'
import CartIcon from '../../assets/Image/cart.svg';




// ============ КОМПОНЕНТ КОРЗИНЫ ============
const CartButton = ({ total, onPress }) => {
  if (total === 0) return null;
  
  return (
    <TouchableOpacity style={styles.cartButton} onPress={onPress}>
      <View style={styles.cartButtonLeft}>
        <CartIcon width={24} height={24} />
        <Text style={styles.cartButtonText}>В корзину</Text>
      </View>
      <Text style={styles.cartButtonPrice}>{total} ₽</Text>
    </TouchableOpacity>
  );
};




// ============ МАЛЕНЬКИЕ КОМПОНЕНТЫ ДЛЯ КАЖДОЙ ВКЛАДКИ ============

// Обновленный компонент для главной страницы
const HomeContent = ({ textSearch, setTextSearch, isLoading }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]); // Состояние для корзины

  // Загружаем товары при монтировании
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/products/records?page=1&perPage=30",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        },
      );

      const data = await response.json();
      
      const transformedProducts = data.items.map(item => ({
        id: item.id,
        title: item.title || 'Без названия',
        category: item.typeCloses || 'Без категории',
        price: item.price ? `${item.price} ₽` : '0 ₽',
        priceValue: item.price || 0,
        description: item.description || 'Нет описания',
        approximate_cost: item.approximate_cost || 'Не указан',
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация товаров по категории
  const getFilteredProducts = () => {
    if (activeCategory === 'all') {
      return products;
    }
    
    const categoryMap = {
      'women': 'Женская одежда',
      'men': 'Мужская одежда'
    };
    
    const targetCategory = categoryMap[activeCategory];
    return products.filter(product => product.category === targetCategory);
  };

  // Проверка, есть ли товар в корзине
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Добавление товара в корзину
  const addToCart = (product) => {
    setCartItems(prev => [...prev, { 
      id: product.id, 
      title: product.title, 
      price: product.priceValue 
    }]);
  };

  // Удаление товара из корзины
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Подсчет общей суммы
  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleAddPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleModalAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      setModalVisible(false);
    }
  };

  const renderCard = ({ id, title, category, price }) => {
    const inCart = isInCart(id);
    
    return (
      <TouchableOpacity 
        key={id} 
        style={styles.card} 
        activeOpacity={1}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>

          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardCategory}>
                {category === 'Женская одежда' ? 'Женщинам' : 
                category === 'Мужская одежда' ? 'Мужчинам' : category}
              </Text>
              <Text style={styles.cardPrice}>{price}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, inCart && styles.removeButton]}
              onPress={() => {
                if (inCart) {
                  removeFromCart(id);
                } else {
                  handleAddPress({ id, title, category, price, priceValue: parseInt(price) });
                }
              }}
            >
              <Text style={[styles.addButtonText, inCart && styles.removeButtonText]}>
                {inCart ? 'Убрать' : 'Добавить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.contentContainer}>
          {/* Поле поиска */}
          <View style={styles.headerSection}>
            <View style={styles.searchContainer}>
              <Image 
                source={require('../../assets/Image/search.png')} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Искать описания"
                value={textSearch}
                onChangeText={setTextSearch}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Блок Акции и новости */}
          <View style={styles.promotionsSection}>
            <Text style={styles.sectionTitle}>Акции и новости</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              <TouchableOpacity activeOpacity={0.9} style={styles.bannerWrapper}>
                <Banner1 width="100%" height="100%" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} style={styles.bannerWrapper}>
                <Banner2 width="100%" height="100%" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Блок Каталог описаний */}
          <View style={styles.catalogSection}>
            <Text style={styles.sectionTitle}>Каталог описаний</Text>
            
            {/* Кнопки категорий */}
            <View style={styles.categoryButtons}>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'all' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('all')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'all' && styles.categoryButtonTextActive
                ]}>Все</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'women' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('women')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'women' && styles.categoryButtonTextActive
                ]}>Женщинам</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'men' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('men')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'men' && styles.categoryButtonTextActive
                ]}>Мужчинам</Text>
              </TouchableOpacity>
            </View>

            {/* Карточки */}
            <View style={styles.cardsGrid}>
              {getFilteredProducts().map(renderCard)}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Кнопка корзины */}
      <CartButton total={getTotalPrice()} onPress={() => {
        // Здесь будет переход в корзину
        console.log('Переход в корзину', cartItems);
      }} />

      {/* Модальное окно с информацией о товаре */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          
          <View 
            style={[
              styles.modalContent,
              {
                paddingBottom: Math.max(insets.bottom, 20),
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProduct?.title}</Text>
              <TouchableOpacity 
                style={styles.closeButtonContainer}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalLabel}>Описание</Text>
              <Text style={styles.modalText}>
                {products.find(p => p.id === selectedProduct?.id)?.description || 'Нет описания'}
              </Text>

              <Text style={styles.modalLabelApproximate}>Примерный расход:</Text>
              <Text style={styles.modalTextApproximate}>
                {products.find(p => p.id === selectedProduct?.id)?.approximate_cost || 'Не указан'}
              </Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleModalAddToCart}
            >
              <Text style={styles.modalButtonText}>
                Добавить за {selectedProduct?.price}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};



// Компонент для каталога
const CatalogContent = ({ textSearch, setTextSearch, isLoading, setActiveTab  }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]); // 👈 Добавляем состояние корзины

  // Загружаем товары при монтировании
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/products/records?page=1&perPage=30",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        },
      );

      const data = await response.json();
      
      const transformedProducts = data.items.map(item => ({
        id: item.id,
        title: item.title || 'Без названия',
        category: item.typeCloses || 'Без категории',
        price: item.price ? `${item.price} ₽` : '0 ₽',
        priceValue: item.price || 0,
        description: item.description || 'Нет описания',
        approximate_cost: item.approximate_cost || 'Не указан',
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация товаров по категории
  const getFilteredProducts = () => {
    if (activeCategory === 'all') {
      return products;
    }
    
    const categoryMap = {
      'women': 'Женская одежда',
      'men': 'Мужская одежда'
    };
    
    const targetCategory = categoryMap[activeCategory];
    return products.filter(product => product.category === targetCategory);
  };

  // 👇 Функции для работы с корзиной
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const addToCart = (product) => {
    setCartItems(prev => [...prev, { 
      id: product.id, 
      title: product.title, 
      price: product.priceValue 
    }]);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleAddPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleModalAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
      setModalVisible(false);
    }
  };

  const renderCard = ({ id, title, category, price }) => {
    const inCart = isInCart(id);
    
    return (
      <TouchableOpacity 
        key={id} 
        style={styles.card} 
        activeOpacity={1}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>

          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardCategory}>
                {category === 'Женская одежда' ? 'Женщинам' : 
                 category === 'Мужская одежда' ? 'Мужчинам' : category}
              </Text>
              <Text style={styles.cardPrice}>{price}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, inCart && styles.removeButton]}
              onPress={() => {
                if (inCart) {
                  removeFromCart(id);
                } else {
                  handleAddPress({ id, title, category, price, priceValue: parseInt(price) });
                }
              }}
            >
              <Text style={[styles.addButtonText, inCart && styles.removeButtonText]}>
                {inCart ? 'Убрать' : 'Добавить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.contentContainer}>
          {/* Поле поиска с иконкой профиля */}
          <View style={styles.headerSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Image 
                  source={require('../../assets/Image/search.png')} 
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Искать описания"
                  value={textSearch}
                  onChangeText={setTextSearch}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <TouchableOpacity 
                style={styles.profileIconContainer}
                onPress={() => setActiveTab('profile')}
              >
                <Image 
                  source={require('../../assets/Image/mainProfile.png')} 
                  style={styles.profileIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Блок Каталог описаний */}
          <View style={styles.catalogSection}>
            {/* Кнопки категорий */}
            <View style={styles.categoryButtons}>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'all' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('all')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'all' && styles.categoryButtonTextActive
                ]}>Все</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'women' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('women')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'women' && styles.categoryButtonTextActive
                ]}>Женщинам</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  activeCategory === 'men' && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory('men')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === 'men' && styles.categoryButtonTextActive
                ]}>Мужчинам</Text>
              </TouchableOpacity>
            </View>

            {/* Карточки */}
            <View style={styles.cardsGrid}>
              {getFilteredProducts().map(renderCard)}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Кнопка корзины */}
      <CartButton total={getTotalPrice()} onPress={() => {
        console.log('Переход в корзину', cartItems);
      }} />

      {/* Модальное окно с информацией о товаре */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          
          <View 
            style={[
              styles.modalContent,
              {
                paddingBottom: Math.max(insets.bottom, 20),
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProduct?.title}</Text>
              <TouchableOpacity 
                style={styles.closeButtonContainer}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalLabel}>Описание</Text>
              <Text style={styles.modalText}>
                {products.find(p => p.id === selectedProduct?.id)?.description || 'Нет описания'}
              </Text>

              <Text style={styles.modalLabelApproximate}>Примерный расход:</Text>
              <Text style={styles.modalTextApproximate}>
                {products.find(p => p.id === selectedProduct?.id)?.approximate_cost || 'Не указан'}
              </Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleModalAddToCart}
            >
              <Text style={styles.modalButtonText}>
                Добавить за {selectedProduct?.price}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

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
  const [textSearch, setTextSearch] = useState("")
  const [activeTab, setActiveTab] = useState('home');

  // Загружаем данные при монтировании компоненaта
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
        return <HomeContent 
          textSearch={textSearch}
          setTextSearch={setTextSearch}
          isLoading={false} // или передайте реальное состояние isLoading если есть
        />;
      case 'catalog':
        return <CatalogContent
          textSearch={textSearch}
          setTextSearch={setTextSearch}
          isLoading={false}
          setActiveTab={setActiveTab}
        />;
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
    <View style={styles.container}>
      {/* Основной контент с учетом безопасной зоны */}
      <View 
        style={[
          styles.mainContent,
          {
            paddingTop: insets.top,
            paddingBottom: 0,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }
        ]}
      >
        {renderActiveContent()}
      </View>

      {/* Нижняя навигация с учетом безопасной зоны снизу */}
      <View 
        style={[
          styles.bottomNavigation,
          { paddingBottom: Math.max(insets.bottom, 12) }
        ]}
      >
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
  // Стили для баннеров
  promotionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#939396',
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingRight: 24,
    gap: 10,
  },
  bannerWrapper: {
    width: 300,
    height: 152,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
    marginTop: 12,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  catalogSection: {
    flex: 1,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#1A6FEE',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7E7E9A',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  cardsGrid: {
    gap: 12,
    paddingBottom: 20,
    marginBottom: 42
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardColumn: {
    flexDirection: 'column',
    gap: 5,
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#939396',
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#2074F2',
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    width: 96,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1, // Это гарантирует, что поиск займет все доступное пространство слева от иконки
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    backgroundColor: "#F5F5F9",
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginRight: 8,
    tintColor: '#7E7E9A',
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
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
  ordersButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  ordersButtonIcon: {
    width: 32,
    height: 32,
    marginRight: 20,
    resizeMode: 'contain',
  },
  ordersButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  notificationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24
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
    marginTop: 122,
  },
  legalLink: {
    marginTop: 24,
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
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
    paddingBottom: 15
  },
  // Обновленные стили для модального окна
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginRight: 10,
  },
  closeButtonContainer: {
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#F5F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 12,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#939396",
    marginBottom: 4,
  },
  modalLabelApproximate: {
    fontSize: 14,
    fontWeight: "400",
    color: "#939396",
    marginBottom: 4,
  },
  modalText: {
    fontSize: 15,
    fontWeight: '400',
    color: "#000000",
    lineHeight: 20,
    marginBottom: 36,
  },
  modalTextApproximate: {
    fontSize: 16,
    fontWeight: '500',
    color: "#000000",
    lineHeight: 20,
    marginBottom: -8,
  },
  modalButton: {
    backgroundColor: "#1A6FEE",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    minHeight: 56,
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 17,
  },
  // Новые стили для строки поиска с иконкой профиля
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIconContainer: {
    marginTop: -24,
    marginRight: -8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  // Стили для кнопки корзины
  cartButton: {
    position: 'absolute',
    bottom: 20, // Высота над нижней навигацией
    left: 24,
    right: 24,
    backgroundColor: '#1A6FEE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartButtonPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Стиль для кнопки "Убрать"
  removeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A6FEE',
  },
  // Стиль для текста кнопки "Убрать"
  removeButtonText: {
    color: '#1A6FEE',
  },
});