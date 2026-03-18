import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateBtnPasswordScreen({ navigation }) {
  const [passwordValue, setPasswordValue] = useState("");
  const [pressedKey, setPressedKey] = useState(null);
  const insets = useSafeAreaInsets();

  // Цифры для клавиатуры (3x3)
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleNumberPress = (num) => {
    if (passwordValue.length < 4) {
      setPasswordValue(passwordValue + num);
    }
  };

  const handleNumberPressIn = (num) => {
    setPressedKey(num);
  };

  const handleNumberPressOut = () => {
    setPressedKey(null);
  };

  const handleDeletePress = () => {
    setPasswordValue(passwordValue.slice(0, -1));
  };

  const handleDeletePressIn = () => {
    setPressedKey("delete");
  };

  const handleDeletePressOut = () => {
    setPressedKey(null);
  };

  const handleZeroPress = () => {
    if (passwordValue.length < 4) {
      setPasswordValue(passwordValue + "0");
    }
  };

  const handleZeroPressIn = () => {
    setPressedKey(0);
  };

  const handleZeroPressOut = () => {
    setPressedKey(null);
  };

  // Сохраняем пароль при вводе 4 цифр
  React.useEffect(() => {
    const savePassword = async () => {
      if (passwordValue.length === 4) {
        try {
          // Сохраняем пароль в AsyncStorage
          await AsyncStorage.setItem("userPassword", passwordValue);
          console.log("Пароль сохранен:", passwordValue);

          // Переходим на главный экран
          navigation.replace("Home");
        } catch (error) {
          console.error("Ошибка сохранения пароля:", error);
          Alert.alert("Ошибка", "Не удалось сохранить пароль");
        }
      }
    };

    savePassword();
  }, [passwordValue, navigation]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {/* Центральный контейнер для вертикального выравнивания */}
      <View style={styles.centerContainer}>
        {/* Верхняя часть с заголовками */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Создайте пароль</Text>
          <Text style={styles.subtitle}>
            Для защиты ваших персональных данных
          </Text>
        </View>

        {/* Индикатор пароля (4 точки) */}
        <View style={styles.passwordDotsContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.passwordDot,
                index < passwordValue.length && styles.passwordDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Цифровая клавиатура */}
        <View style={styles.keyboardContainer}>
          {/* Первые 3 ряда (1-9) */}
          {[0, 1, 2].map((row) => (
            <View key={row} style={styles.keyboardRow}>
              {numbers.slice(row * 3, row * 3 + 3).map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.keyButton,
                    pressedKey === num && styles.keyButtonPressed,
                  ]}
                  onPress={() => handleNumberPress(num)}
                  onPressIn={() => handleNumberPressIn(num)}
                  onPressOut={handleNumberPressOut}
                  activeOpacity={1}
                  delayPressIn={0}
                  delayPressOut={0}
                >
                  <Text
                    style={[
                      styles.keyButtonText,
                      pressedKey === num && styles.keyButtonTextPressed,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Нижний ряд с 0 и кнопкой удаления - ИСПРАВЛЕНО */}
          <View style={styles.bottomRow}>
            {/* Пустой View под первой колонкой */}
            <View style={styles.bottomRowColumn}>
              <View style={styles.emptySpace} />
            </View>

            {/* Кнопка 0 под второй колонкой */}
            <View style={styles.bottomRowColumn}>
              <TouchableOpacity
                style={[
                  styles.zeroButton,
                  pressedKey === 0 && styles.keyButtonPressed,
                ]}
                onPress={handleZeroPress}
                onPressIn={handleZeroPressIn}
                onPressOut={handleZeroPressOut}
                activeOpacity={1}
                delayPressIn={0}
                delayPressOut={0}
              >
                <Text
                  style={[
                    styles.keyButtonText,
                    pressedKey === 0 && styles.keyButtonTextPressed,
                  ]}
                >
                  0
                </Text>
              </TouchableOpacity>
            </View>

            {/* Кнопка удалить под третьей колонкой */}
            <View style={styles.bottomRowColumn}>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  pressedKey === "delete" && styles.keyDeleteBtnPressed,
                ]}
                onPress={handleDeletePress}
                onPressIn={handleDeletePressIn}
                onPressOut={handleDeletePressOut}
                activeOpacity={1}
                delayPressIn={0}
                delayPressOut={0}
              >
                <Image
                  source={require("../../assets/Image/deleteBtn.png")}
                  style={[
                    styles.deleteIcon
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
  // Стили для точек пароля
  passwordDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    gap: 20,
  },
  passwordDot: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1A6FEE",
  },
  passwordDotFilled: {
    backgroundColor: "#1A6FEE",
    borderColor: "#1A6FEE",
  },
  // Стили для клавиатуры
  keyboardContainer: {
    width: "100%",
    maxWidth: 350,
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#F5F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  keyButtonPressed: {
    backgroundColor: "#1A6FEE"
  },
  keyDeleteBtnPressed: {
    backgroundColor: "#F5F5F9"
  },
  keyButtonText: {
    fontSize: 26,
    fontWeight: "500",
    color: "#1f2937",
  },
  keyButtonTextPressed: {
    color: "#FFFFFF",
  },
  // НОВЫЕ СТИЛИ ДЛЯ НИЖНЕГО РЯДА
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  bottomRowColumn: {
    width: 80, // Та же ширина что и у кнопок
    alignItems: "center",
    justifyContent: "center",
  },
  emptySpace: {
    width: 80,
    height: 80,
  },
  zeroButton: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#F5F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  deleteButton: {
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  deleteIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain"
  }
});