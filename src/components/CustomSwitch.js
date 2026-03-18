import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity,
  Animated,
  StyleSheet  // 👈 Добавлен импорт StyleSheet
} from 'react-native';

// Кастомный Switch компонент
const CustomSwitch = ({ value, onValueChange }) => {
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], // Движение ползунка
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5E5', '#1A6FEE'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View style={[styles.customSwitchTrack, { backgroundColor }]}>
        <Animated.View style={[styles.customSwitchThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// 👈 Стили для кастомного Switch
const styles = StyleSheet.create({
  customSwitchTrack: {
    width: 48,
    height: 28,
    borderRadius: 17,
    padding: 2,
    justifyContent: 'center',
  },
  customSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default CustomSwitch; // 👈 Правильный экспорт