import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArrowLeftIcon from '../../assets/Image/arrowLeft.svg';
import BucketIcon from '../../assets/Image/bucket.svg';
import CloseIcon from '../../assets/Image/close.svg';
import MinusIcon from '../../assets/Image/minus.svg';
import PlusIcon from '../../assets/Image/plus.svg';

const CartScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { cartItems: initialCartItems, cartQuantities: initialQuantities } = route.params || { cartItems: [], cartQuantities: {} };
  
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState(initialQuantities);

  useEffect(() => {
    loadProductsDetails();
  }, []);

  const loadProductsDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      const productsData = {};
      const updatedQuantities = { ...quantities };
      
      for (const item of cartItems) {
        const response = await fetch(
          `http://2.nntc.nnov.ru:8900/api/collections/products/records/${item.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          },
        );
        
        const data = await response.json();
        productsData[item.id] = data;
        
        // Если для товара нет количества, устанавливаем 1
        if (!updatedQuantities[item.id]) {
          updatedQuantities[item.id] = 1;
        }
      }
      
      setProducts(productsData);
      setQuantities(updatedQuantities);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const decreaseQuantity = (productId) => {
    const currentQuantity = quantities[productId] || 1;
    if (currentQuantity > 1) {
      setQuantities(prev => ({
        ...prev,
        [productId]: prev[productId] - 1
      }));
    }
  };

  const removeItem = (productId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCartItems);
    
    const updatedProducts = { ...products };
    const updatedQuantities = { ...quantities };
    delete updatedProducts[productId];
    delete updatedQuantities[productId];
    setProducts(updatedProducts);
    setQuantities(updatedQuantities);
  };

  const clearCart = () => {
    Alert.alert(
      'Очистить корзину',
      'Вы уверены, что хотите удалить все товары из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            setCartItems([]);
            setProducts({});
            setQuantities({});
          }
        }
      ]
    );
  };

  const getTotalPrice = () => {
    return Object.keys(products).reduce((sum, productId) => {
      const product = products[productId];
      const quantity = quantities[productId] || 1;
      return sum + (product.price * quantity);
    }, 0);
  };

  const handleGoBack = () => {
    navigation.navigate('Home', {
      updatedCartItems: cartItems,
      updatedQuantities: quantities
    });
  };

  const renderCartItem = (productId) => {
    const product = products[productId];
    const quantity = quantities[productId] || 1;

    return (
      <View key={productId} style={styles.cartItemWrapper}>
        <View style={styles.cartItem}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{product.title}</Text>
            <TouchableOpacity onPress={() => removeItem(productId)}>
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{product.price} ₽</Text>
            
            <View style={styles.quantityControl}>
              <Text style={styles.quantityText}>{quantity} штук</Text>
              <View style={styles.quantityButtons}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => decreaseQuantity(productId)}
                  disabled={quantity <= 1}
                >
                  <MinusIcon width={20} height={20} />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => increaseQuantity(productId)}
                >
                  <PlusIcon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A6FEE" />
        </View>
      </View>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <ArrowLeftIcon width={32} height={32} />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Корзина</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
            <BucketIcon width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Корзина пуста</Text>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {Object.keys(products).map(renderCartItem)}
          </ScrollView>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Сумма</Text>
            <Text style={styles.totalPrice}>{totalPrice} ₽</Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => {
              console.log('Переход к оформлению заказа');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.checkoutButtonText}>Перейти к оформлению заказа</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 28,
    paddingBottom: 0,
    alignSelf: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    paddingBottom: 0
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#939396',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  cartItemWrapper: {
    marginHorizontal: 12,
    marginBottom: 16,
    // Тень для iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Тень для Android
    elevation: 1,
  },
  cartItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    paddingRight: 12
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  checkoutButton: {
    backgroundColor: '#1A6FEE',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;