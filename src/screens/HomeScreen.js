import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSwitch from '../components/CustomSwitch';
import DateTimePicker from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';

// Импортируем иконки
import HomeIcon from '../../assets/Image/main.svg';
import HomeActiveIcon from '../../assets/Image/mainActive.svg';
import CatalogIcon from '../../assets/Image/catalog.svg';
import CatalogActiveIcon from '../../assets/Image/catalogActive.svg';
import ProjectIcon from '../../assets/Image/project.svg';
import ProjectActiveIcon from '../../assets/Image/projectActive.svg';
import ProfileIcon from '../../assets/Image/profile.svg';
import ProfileActiveIcon from '../../assets/Image/profileActive.svg';
import CartIcon from '../../assets/Image/cart.svg';
import PlusIcon from '../../assets/Image/plus.svg';
import ArrowLeftIcon from '../../assets/Image/arrowLeft.svg';

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

// Компонент для главной страницы
const HomeContent = ({ textSearch, setTextSearch, isLoading, navigation, cartItems, setCartItems, cartQuantities, setCartQuantities }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    loadBanners();
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

  const loadBanners = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/promotions_and_news/records?page=1&perPage=30",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        },
      );

      const data = await response.json();
      setBanners(data.items || []);
    } catch (error) {
      console.error('Ошибка загрузки баннеров:', error);
    }
  };

  const getBannerImageUrl = (banner) => {
    if (!banner || !banner.newsImage) return null;
    return `http://2.nntc.nnov.ru:8900/api/files/${banner.collectionId}/${banner.id}/${banner.newsImage}`;
  };

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

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const addToCart = (product) => {
    setCartItems(prev => [...prev, { 
      id: product.id, 
      title: product.title, 
      price: product.priceValue 
    }]);
    setCartQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    const newQuantities = { ...cartQuantities };
    delete newQuantities[productId];
    setCartQuantities(newQuantities);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = cartQuantities[item.id] || 1;
      return sum + (item.price * quantity);
    }, 0);
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

          <View style={styles.promotionsSection}>
            <Text style={styles.sectionTitle}>Акции и новости</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {banners.map((banner, index) => {
                const imageUrl = getBannerImageUrl(banner);
                return (
                  <TouchableOpacity 
                    key={banner.id || index}
                    activeOpacity={0.9} 
                    style={styles.bannerWrapper}
                    onPress={() => {
                      console.log('Нажат баннер:', banner);
                    }}
                  >
                    {imageUrl ? (
                      <Image 
                        source={{ uri: imageUrl }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
                        <Text style={styles.bannerPlaceholderText}>Нет изображения</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.catalogSection}>
            <Text style={styles.sectionTitle}>Каталог описаний</Text>
            
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

            <View style={styles.cardsGrid}>
              {getFilteredProducts().map(renderCard)}
            </View>
          </View>
        </View>
      </ScrollView>

      <CartButton total={calculateTotal()} onPress={() => {
        navigation.navigate('Cart', { 
          cartItems: cartItems,
          cartQuantities: cartQuantities
        });
      }} />

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
const CatalogContent = ({ textSearch, setTextSearch, isLoading, setActiveTab, navigation, cartItems, setCartItems, cartQuantities, setCartQuantities,  setActiveContent }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const addToCart = (product) => {
    setCartItems(prev => [...prev, { 
      id: product.id, 
      title: product.title, 
      price: product.priceValue 
    }]);
    setCartQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    const newQuantities = { ...cartQuantities };
    delete newQuantities[productId];
    setCartQuantities(newQuantities);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = cartQuantities[item.id] || 1;
      return sum + (item.price * quantity);
    }, 0);
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
                onPress={() => {
                  setActiveTab('profile') 
                  setActiveContent('profile');
                }}
              >
                <Image 
                  source={require('../../assets/Image/mainProfile.png')} 
                  style={styles.profileIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.catalogSection}>
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

            <View style={styles.cardsGrid}>
              {getFilteredProducts().map(renderCard)}
            </View>
          </View>
        </View>
      </ScrollView>

      <CartButton total={calculateTotal()} onPress={() => {
        navigation.navigate('Cart', { 
          cartItems: cartItems,
          cartQuantities: cartQuantities
        });
      }} />

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

// Компонент для списка проектов
const ProjectListContent = ({ navigation, setActiveTab, setActiveContent  }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/projects/records?page=1&perPage=30",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        },
      );

      const data = await response.json();
      setProjects(data.items || []);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const renderProjectCard = (project) => {
    const createdDate = formatDate(project.created);
    
    return (
      <View key={project.id} style={styles.projectCard}>
        <View style={styles.projectCardContent}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.projectFooter}>
            <Text style={styles.projectDate}>Создан: {createdDate}</Text>
            <TouchableOpacity 
              style={styles.openButton}
              activeOpacity={0.7}
            >
              <Text style={styles.openButtonText}>Открыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <Text>Загрузка проектов...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.contentContainer}>
        <View style={styles.projectsHeader}>
          <Text style={styles.projectsTitle}>Проекты</Text>
          <TouchableOpacity 
            style={styles.addButtonPlus}
            onPress={() => {
              setActiveContent('createProject'); // меняем контент
              setActiveTab('project'); // сохраняем подсветку вкладки "Проекты"
            }}
          >
            <PlusIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.projectsList}>
          {projects.length === 0 ? (
            <View style={styles.emptyProjects}>
              <Text style={styles.emptyProjectsText}>У вас пока нет проектов</Text>
              <Text style={styles.emptyProjectsSubtext}>Нажмите + чтобы создать первый проект</Text>
            </View>
          ) : (
            projects.map(renderProjectCard)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Компонент для создания проекта
const CreateProjectContent = ({ setActiveTab, setActiveContent }) => {
  const insets = useSafeAreaInsets();
  
  const [projectTitle, setProjectTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectSize, setProjectSize] = useState('');
  const [descriptionSource, setDescriptionSource] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [technicalDrawing, setTechnicalDrawing] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const typeOptions = [
    { label: "Публичный", value: "public" },
    { label: "Приватный", value: "private" },
  ];
  
  const sizeOptions = [
    { label: "Мужское", value: "male" },
    { label: "Женское", value: "female" },
  ];
  
  const categoryOptions = [
    { label: "Шапки", value: "hats" },
    { label: "Кофты", value: "sweaters" },
    { label: "Футболки", value: "t-shirts" },
    { label: "Штаны", value: "pants" },
    { label: "Кроссовки", value: "sneakers" },
  ];

  const isFormValid = () => {
    return projectTitle.trim() !== "" &&
           projectType !== "" &&
           startDate !== "" &&
           endDate !== "" &&
           projectSize !== "" &&
           descriptionSource.trim() !== "" &&
           projectCategory !== "";
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужно разрешение на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setTechnicalDrawing(result.assets[0].uri);
    }
  };

  const formatDateForApi = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleStartDateConfirm = (date) => {
    const formatted = formatDate(date);
    setStartDate(formatted);
    setStartDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date) => {
    const formatted = formatDate(date);
    setEndDate(formatted);
    setEndDatePickerVisible(false);
  };

  const handleCreateProject = async () => {
    if (!isFormValid()) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      
      const formData = new FormData();
      formData.append('title', projectTitle);
      formData.append('type', projectType);
      formData.append('date_start', formatDateForApi(startDate));
      formData.append('date_end', formatDateForApi(endDate));
      formData.append('size', projectSize);
      formData.append('description_source', descriptionSource);
      formData.append('user_id', userId);
      
      if (technicalDrawing) {
        formData.append('technical_drawing', {
          uri: technicalDrawing,
          type: 'image/jpeg',
          name: 'drawing.jpg',
        });
      }

      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/projects/records",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        },
      );

      if (response.ok) {
        Alert.alert("Успех", "Проект успешно создан");
        setActiveContent('project'); // 👈 возвращаемся к списку проектов
        setActiveTab('project');
      } else {
        const errorData = await response.json();
        Alert.alert("Ошибка", errorData.message || "Не удалось создать проект");
      }
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
      Alert.alert("Ошибка", "Не удалось создать проект");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.contentContainer}>
          <View style={styles.createHeader}>
            <Text style={styles.createTitle}>Создать проект</Text>
          </View>

          <View style={styles.createForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Тип проекта</Text>
              <TouchableOpacity
                style={styles.createInput}
                onPress={() => setTypeModalVisible(true)}
              >
                <Text style={[styles.createInputText, !projectType && styles.placeholderText]}>
                  {projectType ? typeOptions.find(o => o.value === projectType)?.label : "Выберите тип"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название проекта</Text>
              <TextInput
                style={styles.createInput}
                placeholder="Введите название"
                value={projectTitle}
                onChangeText={setProjectTitle}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Дата начала</Text>
              <TouchableOpacity
                style={styles.createInput}
                onPress={() => setStartDatePickerVisible(true)}
              >
                <Text style={[styles.createInputText, !startDate && styles.placeholderText]}>
                  {startDate || "Выберите дату"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Дата окончания</Text>
              <TouchableOpacity
                style={styles.createInput}
                onPress={() => setEndDatePickerVisible(true)}
              >
                <Text style={[styles.createInputText, !endDate && styles.placeholderText]}>
                  {endDate || "Выберите дату"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Кому</Text>
              <TouchableOpacity
                style={styles.createInput}
                onPress={() => setSizeModalVisible(true)}
              >
                <Text style={[styles.createInputText, !projectSize && styles.placeholderText]}>
                  {projectSize ? sizeOptions.find(o => o.value === projectSize)?.label : "Выберите кому"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Источник описания</Text>
              <TextInput
                style={styles.createInput}
                placeholder="example@mail.com"
                value={descriptionSource}
                onChangeText={setDescriptionSource}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Категория</Text>
              <TouchableOpacity
                style={styles.createInput}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={[styles.createInputText, !projectCategory && styles.placeholderText]}>
                  {projectCategory ? categoryOptions.find(o => o.value === projectCategory)?.label : "Выберите категорию"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <TouchableOpacity 
                style={styles.imagePicker}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.imagePickerPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <Text style={styles.imagePickerText}>+</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.confirmButton, (!isFormValid() || isSubmitting) && styles.disabledButton]}
              onPress={handleCreateProject}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Подтвердить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DateTimePicker
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartDatePickerVisible(false)}
        maximumDate={new Date()}
        confirmTextIOS="Выбрать"
        cancelTextIOS="Отмена"
        headerTextIOS="Выберите дату начала"
      />

      <DateTimePicker
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndDatePickerVisible(false)}
        minimumDate={startDate ? new Date(formatDateForApi(startDate)) : undefined}
        confirmTextIOS="Выбрать"
        cancelTextIOS="Отмена"
        headerTextIOS="Выберите дату окончания"
      />

      {/* Модальное окно для типа */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={typeModalVisible}
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setTypeModalVisible(false)}
          />
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите тип</Text>
              <TouchableOpacity onPress={() => setTypeModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, projectType === option.value && styles.optionItemActive]}
                onPress={() => {
                  setProjectType(option.value);
                  setTypeModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, projectType === option.value && styles.optionTextActive]}>
                  {option.label}
                </Text>
                {projectType === option.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Модальное окно для размера (кому) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sizeModalVisible}
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSizeModalVisible(false)}
          />
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Кому</Text>
              <TouchableOpacity onPress={() => setSizeModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {sizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, projectSize === option.value && styles.optionItemActive]}
                onPress={() => {
                  setProjectSize(option.value);
                  setSizeModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, projectSize === option.value && styles.optionTextActive]}>
                  {option.label}
                </Text>
                {projectSize === option.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Модальное окно для категории */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCategoryModalVisible(false)}
          />
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Категория</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, projectCategory === option.value && styles.optionItemActive]}
                onPress={() => {
                  setProjectCategory(option.value);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, projectCategory === option.value && styles.optionTextActive]}>
                  {option.label}
                </Text>
                {projectCategory === option.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

// Компонент для профиля
const ProfileContent = ({ userName, userEmail, notificationsEnabled, toggleNotifications, clearAsyncStorage }) => (
  <View style={styles.contentContainer}>
    <View style={styles.headerSection}>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
    </View>

    <TouchableOpacity style={styles.ordersButton}>
      <Image 
        source={require('../../assets/Image/notebook.png')} 
        style={styles.ordersButtonIcon}
      />
      <Text style={styles.ordersButtonText}>Мои заказы</Text>
    </TouchableOpacity>

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
  const [textSearch, setTextSearch] = useState("");
  const [activeTab, setActiveTab] = useState('home');
  const [activeContent, setActiveContent] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});

  useEffect(() => {
    loadUserData();
    loadNotificationSetting();
  }, []);

  useEffect(() => {
    if (navigation && navigation.getState) {
      const unsubscribe = navigation.addListener('focus', () => {
        const state = navigation.getState();
        const routes = state?.routes;
        const currentRoute = routes?.[routes.length - 1];
        
        if (currentRoute?.params?.updatedCartItems) {
          setCartItems(currentRoute.params.updatedCartItems);
          if (currentRoute.params.updatedQuantities) {
            setCartQuantities(currentRoute.params.updatedQuantities);
          }
          navigation.setParams({ updatedCartItems: undefined, updatedQuantities: undefined });
        }
      });
      
      return unsubscribe;
    }
  }, [navigation]);

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

  const saveNotificationSetting = async (value) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Ошибка сохранения настройки уведомлений:', error);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => {
      const newState = !previousState;
      saveNotificationSetting(newState);
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

  const renderActiveContent = () => {
    switch (activeContent) {
      case 'home':
        return <HomeContent 
          textSearch={textSearch}
          setTextSearch={setTextSearch}
          isLoading={false}
          navigation={navigation}
          cartItems={cartItems}
          setCartItems={setCartItems}
          cartQuantities={cartQuantities}
          setCartQuantities={setCartQuantities}
        />;
      case 'catalog':
        return <CatalogContent
          textSearch={textSearch}
          setTextSearch={setTextSearch}
          isLoading={false}
          setActiveTab={setActiveTab}
          navigation={navigation}
          cartItems={cartItems}
          setCartItems={setCartItems}
          cartQuantities={cartQuantities}
          setCartQuantities={setCartQuantities}
          setActiveContent={setActiveContent}
        />;
      case 'project':
        return <ProjectListContent 
          navigation={navigation} 
          setActiveTab={setActiveTab} 
          setActiveContent={setActiveContent}
        />;
      case 'createProject':
        return <CreateProjectContent 
          setActiveTab={setActiveTab}
          setActiveContent={setActiveContent}
        />;
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

      <View 
        style={[
          styles.bottomNavigation,
          { paddingBottom: Math.max(insets.bottom, 12) }
        ]}
      >
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('home');
            setActiveContent('home');
          }}
        >
          {renderIcon('home')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('catalog');
            setActiveContent('catalog');
          }}
        >
          {renderIcon('catalog')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('project');
            setActiveContent('project');
          }}
        >
          {renderIcon('project')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('profile');
            setActiveContent('profile');
          }}
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
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F9',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F9',
  },
  bannerPlaceholderText: {
    fontSize: 14,
    color: '#939396',
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
    marginBottom: 42,
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
    width: 96,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    alignSelf: 'center',
  },
  addButtonPlus: {
    position: 'absolute',
    right: 0
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A6FEE',
  },
  removeButtonText: {
    color: '#1A6FEE',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    backgroundColor: '#F5F5F9',
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
    marginBottom: 24,
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
    paddingBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 10,
  },
  closeButtonContainer: {
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 12,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#939396',
    marginBottom: 4,
  },
  modalLabelApproximate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#939396',
    marginBottom: 4,
  },
  modalText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
    marginBottom: 36,
  },
  modalTextApproximate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 20,
    marginBottom: -8,
  },
  modalButton: {
    backgroundColor: '#1A6FEE',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    minHeight: 56,
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 17,
  },
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
  cartButton: {
    position: 'absolute',
    bottom: 20,
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
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  projectsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  projectCardContent: {
    gap: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 20
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#939396',
  },
  openButton: {
    backgroundColor: '#1A6FEE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyProjects: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyProjectsText: {
    fontSize: 16,
    color: '#939396',
    marginBottom: 8,
  },
  emptyProjectsSubtext: {
    fontSize: 14,
    color: '#C9C9C9',
  },
  createModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  createModalBody: {
    flex: 1,
  },
  createModalBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7E7E9A',
    marginBottom: 8,
  },
  createInput: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
  },
  createInputText: {
    fontSize: 15,
    color: '#1f2937',
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imagePickerPreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    fontSize: 40,
    color: '#939396',
  },
  imagePickerHint: {
    fontSize: 12,
    color: '#939396',
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: '#1A6FEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    minHeight: 56,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 17,
  },
  disabledButton: {
    backgroundColor: '#C9D4FB',
  },
  modalContentSmall: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemActive: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextActive: {
    color: '#1A6FEE',
    fontWeight: '500',
  },
  checkmark: {
    color: '#1A6FEE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  createForm: {
    marginTop: 12,
  },
});