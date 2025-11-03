import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/Api';
import { CustomAlertProvider, useCustomAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ProSubscription'>;

const { width } = Dimensions.get('window');

interface SaleData {
  name: string;
  salePrice: number;
  userAmount: number;
  usedAmount: number;
  userUnlimited: boolean;
  saleExpiration: string | null;
  userSubscriptionTime: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total: number;
}

function ProSubscriptionContent({ navigation }: Props) {
  const benefits = [
    { 
      icon: 'crown', 
      title: 'Sinais Exclusivos VIP', 
      description: 'Acesse sinais premium com alta taxa de acerto',
      iconType: 'font-awesome'
    },
    { 
      icon: 'bell-ring-outline', 
      title: 'Alertas em Tempo Real', 
      description: 'Seja notificado antes de todos os outros usuários',
      iconType: 'material'
    },
    { 
      icon: 'chart-line-variant', 
      title: 'Análises Avançadas', 
      description: 'Gráficos e indicadores exclusivos para VIP',
      iconType: 'material'
    },
    { 
      icon: 'headset', 
      title: 'Suporte Prioritário', 
      description: 'Atendimento exclusivo em canal dedicado',
      iconType: 'font-awesome'
    }
  ];

  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();
  
  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSale, setIsLoadingSale] = useState(true);
  const [error, setError] = useState('');
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  
  // Valores padrão caso não haja oferta ativa
  const defaultPrice = 29.90;
  const defaultOldPrice = 39.90;
  const defaultSubscriptionTime = 30;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const benefitsAnimArray = useRef(benefits.map(() => new Animated.Value(0))).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-width)).current;
  const priceScaleAnim = useRef(new Animated.Value(1)).current;
  const urgencyPulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef<LottieView>(null);

  const scheme = Linking.createURL('/');

  // Calcula tempo restante da oferta
  const calculateTimeRemaining = (expirationDate: string): TimeRemaining => {
    const now = new Date().getTime();
    const expiration = new Date(expirationDate).getTime();
    const difference = expiration - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, total: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, total: difference };
  };

  // Busca dados da oferta ativa
  const fetchActiveSale = async () => {
    try {
      setIsLoadingSale(true);
      const response = await api.get('sale');
      
      if (response.status === 200) {
        console.log("teste" + response.data);
        setSaleData(response.data);
        
        // Se houver data de expiração, inicia o countdown
        if (response.data.saleExpiration) {
          const remaining = calculateTimeRemaining(response.data.saleExpiration);
          setTimeRemaining(remaining);
        }
      }
    } catch (err) {
      console.log('Nenhuma oferta ativa encontrada, usando valores padrão');
      setSaleData(null);
    } finally {
      setIsLoadingSale(false);
    }
  };

  // Atualiza countdown a cada minuto
  useEffect(() => {
    if (saleData?.saleExpiration) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(saleData.saleExpiration!);
        setTimeRemaining(remaining);
        
        // Se a oferta expirou, busca novamente
        if (remaining.total <= 0) {
          fetchActiveSale();
        }
      }, 60000); // Atualiza a cada minuto

      return () => clearInterval(interval);
    }
  }, [saleData]);

  // Animação de urgência para indicadores de escassez
  const startUrgencyAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(urgencyPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(urgencyPulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startEntryAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    translateYAnim.setValue(50);
    benefitsAnimArray.forEach(anim => anim.setValue(0));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    Animated.stagger(
      150,
      benefitsAnimArray.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      )
    ).start();

    startShimmerAnimation();
    
    Animated.timing(logoRotateAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();
  };

  const startPriceAnimation = () => {
    Animated.sequence([
      Animated.timing(priceScaleAnim, {
        toValue: 1.15,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(priceScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start(() => {
      setTimeout(startPriceAnimation, 5000);
    });
  };

  const startShimmerAnimation = () => {
    shimmerAnim.setValue(-width);
    Animated.timing(shimmerAnim, {
      toValue: width,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    }).start(() => {
      setTimeout(startShimmerAnimation, 3000);
    });
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    fetchActiveSale();
    startEntryAnimations();
    startPriceAnimation();
    startUrgencyAnimation();

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    
    if (url.includes('success')) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      
      if (confettiAnim.current) {
        confettiAnim.current.play();
      }
      
      showAlert(
        `Parabéns! Seu acesso VIP de ${saleData?.userSubscriptionTime || defaultSubscriptionTime} dias foi ativado com sucesso. Aproveite todos os benefícios exclusivos agora mesmo!`,
        { title: 'Pagamento Aprovado' }
      );
    } else if (url.includes('failure')) {
      showAlert(
        'Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.',
        { title: 'Pagamento Não Concluído' }
      );
    } else if (url.includes('pending')) {
      showAlert(
        'Seu pagamento está em análise. Assim que for aprovado, seu acesso VIP será ativado automaticamente.',
        { title: 'Pagamento Pendente' }
      );
    }
  };

  const handleSubscription = async () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('payment/create');
      
      if (response.status !== 200) throw new Error('Erro ao criar pagamento');

      const preferenceId = response.data;
      const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;

      await WebBrowser.openBrowserAsync(checkoutUrl);
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      showAlert('Erro ao processar pagamento. Tente novamente.', { title: 'Erro' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (benefit) => {
    if (benefit.iconType === 'font-awesome') {
      return <FontAwesome5 name={benefit.icon} size={24} color="#FFD700" />;
    }
    return <MaterialCommunityIcons name={benefit.icon} size={28} color="#FFD700" />;
  };

  const logoSpin = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-width, width],
    outputRange: [-width * 2, width * 2],
  });

  // Calcula informações da oferta
  const currentPrice = saleData?.salePrice || defaultPrice;
  const subscriptionDays = saleData?.userSubscriptionTime || defaultSubscriptionTime;
  const remainingSlots = saleData && !saleData.userUnlimited 
    ? saleData.userAmount - saleData.usedAmount 
    : null;
  const hasTimeLimit = !!saleData?.saleExpiration && timeRemaining && timeRemaining.total > 0;
  const hasUserLimit = remainingSlots !== null && remainingSlots > 0;

  // Renderiza indicadores de escassez
  const renderUrgencyIndicators = () => {
    if (!hasTimeLimit && !hasUserLimit) return null;

    return (
      <Animated.View 
        style={[
          styles.urgencyContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: urgencyPulseAnim }]
          }
        ]}
      >
        {hasTimeLimit && timeRemaining && (
          <View style={styles.urgencyBadge}>
            <LinearGradient
              colors={['#FF3B30', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.urgencyBadgeGradient}
            >
              <MaterialCommunityIcons name="clock-alert-outline" size={16} color="#FFF" />
              <Text style={[styles.urgencyText, { fontFamily: fonts.bold }]}>
                {timeRemaining.days > 0 
                  ? `Termina em ${timeRemaining.days}d ${timeRemaining.hours}h`
                  : `Termina em ${timeRemaining.hours}h ${timeRemaining.minutes}m`
                }
              </Text>
            </LinearGradient>
          </View>
        )}

        {hasUserLimit && remainingSlots && (
          <View style={styles.urgencyBadge}>
            <LinearGradient
              colors={['#FF3B30', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.urgencyBadgeGradient}
            >
              <MaterialCommunityIcons name="account-group" size={16} color="#FFF" />
              <Text style={[styles.urgencyText, { fontFamily: fonts.bold }]}>
                {remainingSlots === 1 
                  ? 'Última vaga!'
                  : `Apenas ${remainingSlots} vagas`
                }
              </Text>
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    );
  };

  if (isLoadingSale) {
    return (
      <LinearGradient
        colors={['#000000', '#141428', '#1A1A35', '#141428', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={[styles.loadingText, { fontFamily: fonts.regular }]}>
              Carregando ofertas...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#141428', '#1A1A35', '#141428', '#000000']}
      style={styles.container}
    >
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
        >
          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              <LottieView
                ref={confettiAnim}
                source={require('../assets/confetti.json')}
                style={styles.confettiAnimation}
                loop={false}
                autoPlay
                resizeMode="cover"
              />
            </View>
          )}

          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim }
                ]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ rotate: logoSpin }] }}>
              <Image source={require('../assets/logo_white_label.png')} style={styles.logo} />
            </Animated.View>
            
            <MaskedView
              maskElement={
                <View style={styles.proBadgeMask}>
                  <Text style={[styles.proBadgeText, { fontFamily: fonts.bold }]}>
                    {saleData?.name || 'ACESSO VIP'}
                  </Text>
                </View>
              }
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proBadge}
              >
                <Animated.View 
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: [{ translateX: shimmerTranslate }]
                  }}
                />
                <Text style={[styles.proBadgeText, { opacity: 0, fontFamily: fonts.bold }]}>
                  {saleData?.name || 'ACESSO VIP'}
                </Text>
              </LinearGradient>
            </MaskedView>
          </Animated.View>

          {renderUrgencyIndicators()}

          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim }
                ]
              }
            ]}
          >
            <Text style={[styles.heroSubtitle, { fontFamily: fonts.medium }]}>ELEVE SUA EXPERIÊNCIA</Text>
            <Text style={[styles.heroTitle, { fontFamily: fonts.extraBold }]}>
              TORNE-SE <Text style={{color: '#FFD700'}}>VIP</Text>
            </Text>
            
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Animated.View
                style={{
                  transform: [
                    { 
                      rotate: logoRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg']
                      }) 
                    }
                  ]
                }}
              >
                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              </Animated.View>
              <View style={styles.separatorLine} />
            </View>
            
            <Text style={[styles.heroDescription, { fontFamily: fonts.regular }]}>
              Desbloqueie recursos exclusivos e maximize seus resultados com {subscriptionDays} dias de acesso premium
            </Text>
          </Animated.View>

          <View style={styles.benefitsSection}>
            <Animated.Text 
              style={[
                styles.sectionTitle, 
                { 
                  fontFamily: fonts.bold,
                  opacity: fadeAnim,
                  transform: [{ translateY: translateYAnim }]
                }
              ]}
            >
              BENEFÍCIOS EXCLUSIVOS
            </Animated.Text>
            
            {benefits.map((benefit, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.benefitCard,
                  {
                    opacity: benefitsAnimArray[index],
                    transform: [
                      { 
                        translateX: benefitsAnimArray[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        }) 
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.benefitIconContainer}
                >
                  {renderIcon(benefit)}
                </LinearGradient>
                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, { fontFamily: fonts.semibold }]}>{benefit.title}</Text>
                  <Text style={[styles.benefitDescription, { fontFamily: fonts.regular }]}>{benefit.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View 
            style={[
              styles.pricingSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(40, 40, 80, 0.9)', 'rgba(30, 30, 60, 0.9)']}
              style={styles.pricingCard}
            >
              {saleData && (
                <View style={styles.ribbon}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ribbonGradient}
                  >
                    <Text style={[styles.ribbonText, { fontFamily: fonts.bold }]}>OFERTA ESPECIAL</Text>
                  </LinearGradient>
                </View>
              )}
              
              <View style={styles.priceContainer}>
                {saleData && (
                  <Text style={[styles.oldPrice, { fontFamily: fonts.regular }]}>
                    DE R${defaultOldPrice.toFixed(2)}
                  </Text>
                )}
                
                <Animated.View 
                  style={[
                    styles.currentPriceRow,
                    {
                      transform: [{ scale: priceScaleAnim }]
                    }
                  ]}
                >
                  <Text style={[styles.currency, { fontFamily: fonts.bold }]}>R$</Text>
                  <Text style={[styles.price, { fontFamily: fonts.extraBold }]}>
                    {currentPrice.toFixed(2)}
                  </Text>
                </Animated.View>
                
                <View style={styles.subscriptionInfo}>
                  <MaterialCommunityIcons name="calendar-check" size={18} color="#FFD700" />
                  <Text style={[styles.subscriptionDays, { fontFamily: fonts.semibold }]}>
                    {subscriptionDays} dias de acesso VIP
                  </Text>
                </View>
                
                <Text style={[styles.billingInfo, { fontFamily: fonts.regular }]}>
                  Pagamento único • Acesso imediato após aprovação
                </Text>
              </View>

              <View style={styles.paymentMethodsContainer}>
                <View style={styles.pixBadge}>
                  <MaterialCommunityIcons name="qrcode" size={20} color="#32BCAD" />
                  <Text style={[styles.pixText, { fontFamily: fonts.semibold }]}>Pagamento via PIX</Text>
                </View>
                
                <View style={styles.mercadoPagoContainer}>
                  <Text style={[styles.securePaymentText, { fontFamily: fonts.regular }]}>
                    Pagamento seguro em parceria com
                  </Text>
                    <View style={styles.mercadoPagoLogo}>
                      <Image
                        source={require('../assets/mercadopago.png')}
                        style={styles.mercadoPagoImage}
                      />
                      <Text style={[styles.mercadoPagoText, { fontFamily: fonts.bold }]}>mercado pago</Text>
                    </View>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {[
                  'Todos os benefícios listados',
                  'Atualizações exclusivas',
                  'Prioridade em novos recursos'
                ].map((feature, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.featureRow,
                      {
                        opacity: benefitsAnimArray[index],
                        transform: [
                          { 
                            translateX: benefitsAnimArray[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            }) 
                          }
                        ]
                      }
                    ]}
                  >
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFD700" />
                    <Text style={[styles.featureText, { fontFamily: fonts.regular }]}>{feature}</Text>
                  </Animated.View>
                ))}
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleSubscription}
                  disabled={isLoading}
                  activeOpacity={0.8}
                  onPressIn={() => {
                    Animated.timing(buttonScaleAnim, {
                      toValue: 0.95,
                      duration: 100,
                      useNativeDriver: true,
                    }).start();
                  }}
                  onPressOut={() => {
                    Animated.timing(buttonScaleAnim, {
                      toValue: 1,
                      duration: 100,
                      useNativeDriver: true,
                    }).start();
                  }}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButtonGradient}
                  >
                    {isLoading ? (
                      // wrap loader in the same content container so it stays centered
                      <View style={styles.ctaButtonContent}>
                        <ActivityIndicator color="#000" size="small" />
                      </View>
                    ) : (
                      <View style={styles.ctaButtonContent}>
                        <MaterialCommunityIcons name="rocket" size={18} color="#000" />
                        <Text style={[styles.ctaButtonText, { fontFamily: fonts.extraBold }]}>\
                          GARANTIR ACESSO VIP
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {error ? (
                <Text style={[styles.errorText, { fontFamily: fonts.medium }]}>{error}</Text>
              ) : null}
            </LinearGradient>
          </Animated.View>

          <Animated.View 
            style={[
              styles.guaranteeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }]
              }
            ]}
          >
            <View style={styles.guaranteeBadge}>
              <MaterialCommunityIcons name="shield-check" size={22} color="#0000" />
            </View>
            <Text style={[styles.guaranteeText, { fontFamily: fonts.regular }]}>
              7 dias de garantia de satisfação ou seu dinheiro de volta
            </Text>
          </Animated.View>

          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }]
            }}
          >
            <TouchableOpacity 
              onPress={() => {
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  navigation.goBack();
                });
              }} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color="#ccc" />
              <Text style={[styles.backButtonText, { fontFamily: fonts.regular }]}>Voltar</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function ProSubscriptionScreen(props: Props) {
  return (
    <CustomAlertProvider>
      <ProSubscriptionContent {...props} />
    </CustomAlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  proBadge: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
    minWidth: 120,
  },
  proBadgeMask: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 32,
  },
  proBadgeText: {
    fontSize: 16,
    color: '#FFD700',
    letterSpacing: 1,
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  urgencyBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  urgencyBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  urgencyText: {
    fontSize: 14,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 2,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#FFD700',
    marginHorizontal: 8,
    opacity: 0.5,
  },
  heroDescription: {
    fontSize: 15,
    color: '#DDD',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 22,
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A35',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  pricingSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  pricingCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'rgba(30,30,60,0.95)',
  },
  ribbon: {
    position: 'absolute',
    top: -18,
    left: 24,
    zIndex: 2,
  },
  ribbonGradient: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonText: {
    fontSize: 13,
    color: '#000',
    letterSpacing: 1,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: '#FFD700',
    textDecorationLine: 'line-through',
    marginBottom: 2,
    opacity: 0.7,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currency: {
    fontSize: 18,
    color: '#FFD700',
    marginRight: 2,
  },
  price: {
    fontSize: 32,
    color: '#FFD700',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
  subscriptionDays: {
    fontSize: 15,
    color: '#FFD700',
  },
  billingInfo: {
    fontSize: 13,
    color: '#FFD700',
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  paymentMethodsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  pixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(50, 188, 173, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  pixText: {
    fontSize: 15,
    color: '#32BCAD',
  },
  mercadoPagoContainer: {
    alignItems: 'center',
    gap: 3,
  },
  securePaymentText: {
    fontSize: 12,
    color: '#DDD',
    opacity: 0.8,
  },
  mercadoPagoLogo: {
    backgroundColor: '#009EE3',
    paddingLeft: 126,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mercadoPagoText: {
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
    marginLeft: 0,
    paddingHorizontal: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  mercadoPagoImage: {
    width: 110,
    height: 28,
    resizeMode: 'contain',
    position: 'absolute',
    left: 8,
    zIndex: 2,
  },
  featuresContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 8,
  },
  ctaButton: {
    width: '100%',
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    // keep the button a fixed height so content swaps (text <-> loader) won't resize it
    minHeight: 56,
  },
  ctaButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    // ensure gradient fills the full width of the touchable so it doesn't shrink
    width: '100%',
    minHeight: 56,
  },
  ctaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // keep content centered and full width so ActivityIndicator stays centered
    width: '100%',
  },
  ctaButtonText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    letterSpacing: 1,
  },
  errorText: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  guaranteeSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  guaranteeBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 8,
    marginBottom: 6,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    opacity: 0.8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#ccc',
    marginLeft: 8,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
    pointerEvents: 'none',
  },
  confettiAnimation: {
    width: '100%',
    height: 200,
  },
});