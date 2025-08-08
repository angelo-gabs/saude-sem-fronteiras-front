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
import ComboBox from "../../components/ComboBox";
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import {
  ERROR_CITIES,
  ERROR_COUNTRIES,
  ERROR_STATES,
  ERROR_USER,
  FAIL_ADDRESS,
  FAIL_CITIES,
  FAIL_COUNTRIES,
  FAIL_STATES,
  FAIL_USER,
} from "../../utils/messages";

const AddressRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [state, setState] = useState<{
    id: number;
    description: string;
    countryId: number;
  } | null>(null);
  const [city, setCity] = useState<{
    id: number;
    description: string;
    stateId: number;
  } | null>(null);
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [allStates, setAllStates] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [allCities, setAllCities] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);

  const [filteredStates, setFilteredStates] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [filteredCities, setFilteredCities] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);

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
      let cityId = city?.id;
      setLoading(true);
      await apiPost("/Address", {
        district,
        street,
        number,
        complement,
        cityId,
        userId,
      });

      router.replace({
        pathname: "/register/doctor-patient-register",
      });
    } catch (err: any) {
      setMessage(FAIL_ADDRESS);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_USER);
        if (value) {
          const user: User = JSON.parse(value);
          setUserId(user.id);
        } else {
          setMessage(FAIL_USER);
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessage(ERROR_USER);
        setErrorModalVisible(true);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/Country/all");

        if (response && Array.isArray(response.data)) {
          const formattedCountries = response.data.map(
            (country: { id: number; description: string }) => ({
              id: country.id,
              label: country.description,
              comparativeId: country.id,
            })
          );
          setCountries(formattedCountries);
        } else {
          setCountries([]);
          setMessage(FAIL_COUNTRIES);
          setErrorModalVisible(true);
        }
      } catch (err: any) {
        setMessage(ERROR_COUNTRIES);
        setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/State/all");

        if (response && Array.isArray(response.data)) {
          const formattedStates = response.data.map(
            (state: {
              id: number;
              description: string;
              countryId: number;
            }) => ({
              id: state.id,
              label: state.description,
              comparativeId: state.countryId,
            })
          );
          setAllStates(formattedStates);
        } else {
          setAllStates([]);
          setMessage(FAIL_STATES);
          setErrorModalVisible(true);
        }
      } catch (err: any) {
        setMessage(ERROR_STATES);
        setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/City/all");
        if (response && Array.isArray(response.data)) {
          const formattedCities = response.data.map(
            (city: { id: number; description: string; stateId: number }) => ({
              id: city.id,
              label: city.description,
              comparativeId: city.stateId,
            })
          );
          setAllCities(formattedCities);
        } else {
          setAllCities([]);
          setMessage(FAIL_CITIES);
          setErrorModalVisible(true);
        }
      } catch (err: any) {
        setMessage(ERROR_CITIES);
        setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    if (country) {
      // Filtrar estados com base no país selecionado
      setFilteredStates(
        allStates.filter((state) => state.comparativeId === country.id)
      );
      // Limpar estado e cidade quando o país mudar
      setState(null);
      setCity(null);
    } else {
      setFilteredStates(allStates);
    }
  }, [country, allStates]);

  useEffect(() => {
    if (state) {
      setFilteredCities(
        allCities.filter((city) => city.comparativeId === state.id)
      );
      setCity(null);
    } else {
      setFilteredCities(allCities);
    }
  }, [state, allCities]);

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
        title="Cadastro do Endereço"
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
              <ComboBox
                label="País"
                data={countries}
                onSelect={(selectedCountry) => {
                  setCountry({
                    id: selectedCountry.id,
                    description: selectedCountry.label,
                  });
                }}
                placeholder="Escolha um país"
                value={country?.description || ""}
              />
              <ComboBox
                label="Estado"
                data={filteredStates}
                onSelect={(selectedState) => {
                  setState({
                    id: selectedState.id,
                    description: selectedState.label,
                    countryId: selectedState.comparativeId,
                  });
                }}
                placeholder="Escolha um Estado"
                value={state?.description || ""}
              />
              <ComboBox
                label="Cidade"
                data={filteredCities}
                onSelect={(selectedCity) =>
                  setCity({
                    id: selectedCity.id,
                    description: selectedCity.label,
                    stateId: selectedCity.comparativeId,
                  })
                }
                placeholder="Escolha uma Cidade"
                value={city?.description || ""}
              />
              <Input
                label="Bairro"
                autoCorrect={false}
                placeholder="Ponte Seca"
                value={district}
                onChangeText={(value) => setDistrict(value)}
                style={styles.input}
              />
              <Input
                label="Rua"
                autoCorrect={false}
                placeholder="Evaristo Canal"
                value={street}
                onChangeText={(value) => setStreet(value)}
                style={styles.input}
              />
              <Input
                label="Número"
                autoCorrect={false}
                placeholder="186"
                value={number}
                onChangeText={(value) => setNumber(value)}
                style={styles.input}
              />
              <Input
                label="Complemento"
                autoCorrect={false}
                placeholder="Casa de dois andares"
                value={complement}
                onChangeText={(value) => setComplement(value)}
                style={styles.input}
              />
              <Button onPress={handleAddressRegistry} style={styles.button}>
                PRÓXIMO
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

export default AddressRegistryPage;
