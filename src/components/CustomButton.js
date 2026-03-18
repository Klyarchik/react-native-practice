import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  className = '' 
}) => {
  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'bg-transparent border-2 border-primary',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary',
  };

  return (
    <TouchableOpacity
      className={`${variantStyles[variant]} rounded-xl p-4 items-center justify-center ${className} ${
        loading ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#f4511e' : '#fff'} />
      ) : (
        <Text className={`${textStyles[variant]} font-bold text-lg`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;