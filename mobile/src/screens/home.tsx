import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Animated, 
  Dimensions,
  StatusBar,
  RefreshControl,
  Platform
} from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Footer from '../components/footer';
import * as SecureStore from "expo-secure-store";
import { api } from "../config/Api";
import { TermModal } from '../components/term';
import { showCustomAlert } from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type SubscriptionType = 'FREE' | 'PRO' | 'PREMIUM' | null;

export default function HomeScreen({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();
  const [showTermModal, setShowTermModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionType>(null);
  const [username, setUsername] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Animation for cards
  const cardAnimations = Array(4).fill(0).map(() => ({
    scale: useRef(new Animated.Value(1)).current,
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(20)).current
  }));

  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
    
    // Animate cards sequentially
    cardAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(300 + index * 100),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start();
    });
    
    // Get username from storage
    const getUserInfo = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }

        const lastLoginDate = await AsyncStorage.getItem('lastLogin');
        if (lastLoginDate) {
          setLastLogin(lastLoginDate);
        } else {
          const now = new Date().toISOString();
          await AsyncStorage.setItem('lastLogin', now);
          setLastLogin(now);
        }
      } catch (error) {
        console.log("Erro ao recuperar informações do usuário", error);
      }
    };
    
    getUserInfo();
    fetchSubscription();
    checkTermAcceptance();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      fetchSubscription();
      return () => {};
    }, [])
  );
  
  const fetchSubscription = async() => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        console.log("Erro ao recuperar o token.");
        return;
      }
      
      const response = await api.get(
        "users/subscription",
        { headers: { Authorization: `Bearer ${token}`}}
      );
      
      if (response.status === 200 && response.data.userSubscription) {
        try { 
          await AsyncStorage.setItem("subscription", response.data.userSubscription);
          setSubscription(response.data.userSubscription as SubscriptionType);
          // await AsyncStorage.setItem("subscription", "PREMIUM");
          // setSubscription("PREMIUM" as SubscriptionType);
        } catch (error) {
          console.log("Erro ao salvar dados no AsyncStorage");
        }
      }
    } catch (error) {
        console.log("Erro ao recuperar assinatura do usuário", error);
    }
  };

  const checkTermAcceptance = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return;
      
      const response = await api.get(
        "acceptance/has-accepted-latest",
        { headers: {Authorization: `Bearer ${token}`} }
      );
      
      if (response.status === 200 && response.data === false) {
        setShowTermModal(true);
      }
      if (response.status === 404) {
        showCustomAlert("Erro ao validar usuário, faça login novamente", "Erro");
      }
    } catch (error) {
      showCustomAlert("Erro ao verificar aceite dos termos.", "Erro");
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscription();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula a espera da atualização
    setRefreshing(false);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'hoje';
    } else if (diffDays === 1) {
      return 'ontem';
    } else {
      return `há ${diffDays} dias`;
    }
  };
  
  const handleCardPress = (cardAnimation: any, navigationTarget: keyof RootStackParamList) => {
    Animated.sequence([
      Animated.timing(cardAnimation.scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(cardAnimation.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      navigation.navigate(navigationTarget);
    });
  };
  
  const getSubscriptionBadge = () => {
    if (!subscription || subscription === 'FREE') {
      return { text: 'GRATUITO', color: colors.muted, icon: 'account-outline' };
    } else if (subscription === "PRO") {
      return { text: 'PRO', color: '#FFC107', icon: 'crown' };
    } else if (subscription === 'PREMIUM') {
      return { text: 'PREMIUM', color: '#8E24AA', icon: 'diamond-stone' };
    }
    return { text: 'GRATUITO', color: colors.muted, icon: 'account-outline' };
  };
  
  const badge = getSubscriptionBadge();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, '#222222']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.secondary]}
              tintColor="#FFFFFF"
            />
          }
        >
          <Animated.View 
            style={[
              styles.headerSection, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY }, { scale: scaleAnim }]
              }
            ]}
          >
            <Image source={require('../assets/logo_white_label.png')} style={styles.logo} />
            
            <View style={styles.userInfoContainer}>
              <View style={styles.greetingContainer}>
                <Text style={[styles.welcomeText, { color: '#FFFFFF', fontFamily: fonts.regular }]}>
                  Bem-vindo{username ? ', ' : ''}
                </Text>
                {username && (
                  <Text style={[styles.usernameText, { color: '#FFFFFF', fontFamily: fonts.bold }]}>
                    {username}
                  </Text>
                )}
              </View>
              
              <View style={[styles.subscriptionBadge, { backgroundColor: badge.color }]}>
                <MaterialCommunityIcons name={badge.icon} size={14} color="#FFF" />
                <Text style={styles.subscriptionText}>{badge.text}</Text>
              </View>
            </View>
            
            <Text style={[styles.title, { color: '#FFFFFF', fontFamily: fonts.extraBold }]}>
              UNIVERSO CHAMAGOL
            </Text>
            
            {lastLogin && (
              <Text style={[styles.lastLoginText, { color: '#FFFFFF88', fontFamily: fonts.regular }]}>
                Último acesso: {formatDate(lastLogin)}
              </Text>
            )}
          </Animated.View>
          
          <View style={styles.cardsContainer}>
            <Animated.View 
              style={[
                styles.cardWrapper,
                { 
                  opacity: cardAnimations[0].opacity,
                  transform: [
                    { translateY: cardAnimations[0].translateY },
                    { scale: cardAnimations[0].scale }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.card, shadows.medium, { backgroundColor: colors.background }]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[0], 'Timeline')}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.highlight]}
                  style={styles.cardIconContainer}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <MaterialCommunityIcons name="fire" size={30} color="#FFF" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
                    Sinais
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
                    Acesse as dicas e análises esportivas
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.cardWrapper,
                { 
                  opacity: cardAnimations[1].opacity,
                  transform: [
                    { translateY: cardAnimations[1].translateY },
                    { scale: cardAnimations[1].scale }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.card, shadows.medium, { backgroundColor: colors.background }]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[1], 'Profile')}
              >
                <LinearGradient
                  colors={['#3498db', '#2980b9']}
                  style={styles.cardIconContainer}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <MaterialCommunityIcons name="account" size={30} color="#FFF" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
                    Perfil
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
                    Gerencie suas informações pessoais
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.cardWrapper,
                { 
                  opacity: cardAnimations[2].opacity,
                  transform: [
                    { translateY: cardAnimations[2].translateY },
                    { scale: cardAnimations[2].scale }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.card, shadows.medium, { backgroundColor: colors.background }]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[2], 'About')}
              >
                <LinearGradient
                  colors={['#27ae60', '#2ecc71']}
                  style={styles.cardIconContainer}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <MaterialCommunityIcons name="information" size={30} color="#FFF" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
                    Sobre Nós
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
                    Conheça nossa história e missão
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
              </TouchableOpacity>
            </Animated.View>
            
            {(!subscription || subscription === 'FREE') && (
              <Animated.View 
                style={[
                  styles.cardWrapper,
                  { 
                    opacity: cardAnimations[3].opacity,
                    transform: [
                      { translateY: cardAnimations[3].translateY },
                      { scale: cardAnimations[3].scale }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[styles.premiumCard, shadows.medium]}
                  activeOpacity={0.8}
                  onPress={() => handleCardPress(cardAnimations[3], 'ProSubscription')}
                >
                  <LinearGradient
                    colors={['#F2994A', '#F2C94C']}
                    style={styles.premiumCardGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                  >
                    <View style={styles.premiumContent}>
                      <MaterialCommunityIcons name="crown" size={40} color="#FFF" />
                      <Text style={[styles.premiumTitle, { fontFamily: fonts.bold }]}>
                        ATUALIZE PARA PRO
                      </Text>
                      <Text style={[styles.premiumDescription, { fontFamily: fonts.regular }]}>
                        Desbloqueie recursos exclusivos e aumente suas chances de sucesso!
                      </Text>
                      <View style={styles.premiumButton}>
                        <Text style={[styles.premiumButtonText, { fontFamily: fonts.semibold }]}>
                          VER PLANOS
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#FFF" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
      
      <Footer />
      
      <TermModal
        visible={showTermModal}
        onAccepted={() => setShowTermModal(false)}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
  },
  usernameText: {
    fontSize: 16,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  subscriptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  lastLoginText: {
    fontSize: 12,
    marginBottom: 16,
  },
  cardsContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
  },
  premiumCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
  },
  premiumCardGradient: {
    width: '100%',
    padding: 20,
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  premiumDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 5,
  },
});