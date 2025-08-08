import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import SimpleModal from "../../components/Modal";
import { apiGet, apiPut } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_CREDENTIALS,
  STORAGE_EMAIL,
  STORAGE_USER,
} from "../../constants/storage";
import { Credentials } from "../../domain/Credentials/credentials";
import {
  ERROR_GET_USER_REGISTRY,
  ERROR_PASSWORD_CREATE,
  PASSWORD_INCORRECT,
} from "../../utils/messages";
import InputPassword from "../../components/Input/inputPassword";

const NewPasswordPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    console.log("Labels selecionadas:", labels);
  };

  const handleAddressRegistry = async () => {
    try {
      if (password === confirmedPassword) {
        setLoading(true);

        const email = await AsyncStorage.getItem(STORAGE_EMAIL);
        await apiPut("/Credentials/Password", {
          email,
          password,
        });

        const response = await apiGet<Credentials>(
          `/Credentials/${email}/${password}`
        );

        AsyncStorage.setItem(
          STORAGE_CREDENTIALS,
          JSON.stringify(response.data)
        );

        const userResponse = await apiGet<Credentials>(
          `/Users/credentialsId/${response.data.id}`
        );

        AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userResponse.data));

        const userOrDoctor = await apiGet<number>(
          `/Users/id/${userResponse.data.id}`
        );

        if (userOrDoctor.data === 1) {
          router.replace("/home-doctor");
        } else if (userOrDoctor.data === 2) {
          router.replace("/home-patient");
        } else {
          setMessage(ERROR_GET_USER_REGISTRY);
          setErrorModalVisible(true);
        }
      } else {
        setMessage(PASSWORD_INCORRECT);
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setMessage(ERROR_PASSWORD_CREATE);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(offset.y, {
        toValue: 0,
        speed: 4,
        useNativeDriver: true,
        bounciness: 20,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Cadastro Nova Senha"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: opacity, transform: [{ translateY: offset.y }] },
            ]}
          >
            <View style={styles.formContainer}>
              <InputPassword
                label="Informe a nova senha"
                placeholder="*****"
                autoCorrect={false}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                }}
                textContentType="password"
                secureTextEntry
                isPassword={true}
              />
              <InputPassword
                label="Confirme a nova senha"
                placeholder="*****"
                autoCorrect={false}
                value={confirmedPassword}
                onChangeText={(value) => setConfirmedPassword(value)}
                textContentType="password"
                secureTextEntry
                isPassword={true}
              />
              <Button
                onPress={handleAddressRegistry}
                loading={loading}
                style={styles.button}
              >
                CONCLUIR
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={message}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default NewPasswordPage;
