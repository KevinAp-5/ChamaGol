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
import { showCustomAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ProSubscription'>;

const { width } = Dimensions.get('window');

export default function ProSubscriptionScreen({ navigation }: Props) {
  
  // Lista de benefícios da assinatura PRO
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const benefitsAnimArray = useRef(benefits.map(() => new Animated.Value(0))).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-width)).current;
  const priceScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef<LottieView>(null);

  // Configuração do esquema do deep link
  const scheme = Linking.createURL('/');

  // Função para iniciar a animação de entrada
  const startEntryAnimations = () => {
    // Reset animation values
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    translateYAnim.setValue(50);
    benefitsAnimArray.forEach(anim => anim.setValue(0));
    
    // Sequence of animations
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
        easing: Easing.out(Easing.back(0)),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Staggered animation for benefits
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
    
    // Start the shimmer effect animation
    startShimmerAnimation();
    
    // Spin logo on mount
    Animated.timing(logoRotateAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();
  };
  
  // Pulsing animation for the price
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
      // Repeat the animation every 5 seconds
      setTimeout(startPriceAnimation, 5000);
    });
  };
  
  // Shimmer effect animation
  const startShimmerAnimation = () => {
    shimmerAnim.setValue(-width);
    Animated.timing(shimmerAnim, {
      toValue: width,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    }).start(() => {
      // Repeat the animation every 3 seconds
      setTimeout(startShimmerAnimation, 3000);
    });
  };

  useEffect(() => {
    // Listener para deep links que retornam do checkout Mercado Pago
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Initialize animations
    startEntryAnimations();
    startPriceAnimation();
    
    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    
    if (url.includes('success')) {
      setShowConfetti(true); // Mostra a animação
      setTimeout(() => setShowConfetti(false), 2500); // Esconde após 2.5s (ajuste conforme a duração do seu confetti)
      if (confettiAnim.current) {
        confettiAnim.current.play();
      }
      showCustomAlert(
        'Parabéns! Sua assinatura VIP foi ativada com sucesso. Aproveite todos os benefícios exclusivos agora mesmo!',
        '✅ Pagamento Aprovado'
      );
      // Aqui você poderia navegar para uma tela de sucesso ou atualizar o status do usuário
    } else if (url.includes('failure')) {
      showCustomAlert(
        'Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.',
        '❌ Pagamento Não Concluído'
      );
    } else if (url.includes('pending')) {
      showCustomAlert(
        'Seu pagamento está em análise. Assim que for aprovado, sua assinatura será ativada automaticamente.',
        '⏳ Pagamento Pendente',
      );
    }
  };

  const handleSubscription = async () => {
    // Button press animation
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
      // Solicita o preferenceId ao backend
      const response = await api.post('payment/create');
      if (response.status !== 200) throw new Error('Erro ao criar assinatura');

      const preferenceId = response.data;

      // Monta a URL do checkout Mercado Pago
      const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;

      // Abre o navegador nativo integrado
      await WebBrowser.openBrowserAsync(checkoutUrl);

    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      console.error('Erro no pagamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderiza ícones de diferentes bibliotecas
  const renderIcon = (benefit) => {
    if (benefit.iconType === 'font-awesome') {
      return <FontAwesome5 name={benefit.icon} size={24} color="#FFD700" />;
    }
    return <MaterialCommunityIcons name={benefit.icon} size={28} color="#FFD700" />;
  };
  
  // Interpolate logoRotateAnim to rotation
  const logoSpin = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Create shimmer effect with linear gradient
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-width, width],
    outputRange: [-width * 2, width * 2],
  });

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
          {/* Hidden confetti animation that plays on successful purchase */}
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
          
          {/* Header com logo e título PRO */}
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
                  <Text style={[styles.proBadgeText, { fontFamily: fonts.bold }]}>ACESSO VIP</Text>
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
                <Text style={[styles.proBadgeText, { opacity: 0, fontFamily: fonts.bold }]}>ACESSO VIP</Text>
              </LinearGradient>
            </MaskedView>
          </Animated.View>

          {/* Seção principal com título e subtítulo */}
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
              Desbloqueie recursos exclusivos e maximize seus resultados com nossa assinatura premium
            </Text>
          </Animated.View>

          {/* Seção de benefícios */}
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

          {/* Cartão de preço com CTA */}
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
              
              <View style={styles.priceContainer}>
                <Text style={[styles.oldPrice, { fontFamily: fonts.regular }]}>DE R$39,90</Text>
                <Animated.View 
                  style={[
                    styles.currentPriceRow,
                    {
                      transform: [{ scale: priceScaleAnim }]
                    }
                  ]}
                >
                  <Text style={[styles.currency, { fontFamily: fonts.bold }]}>R$</Text>
                  <Text style={[styles.price, { fontFamily: fonts.extraBold }]}>29,90</Text>
                  <View style={styles.periodContainer}>
                    <Text style={[styles.period, { fontFamily: fonts.regular }]}>/mês</Text>
                  </View>
                </Animated.View>
                <Text style={[styles.billingInfo, { fontFamily: fonts.regular }]}>Sem compromisso, cancele quando quiser</Text>
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
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <View style={styles.ctaButtonContent}>
                        <MaterialCommunityIcons name="rocket" size={18} color="#000" />
                        <Text style={[styles.ctaButtonText, { fontFamily: fonts.extraBold }]}>COMEÇAR AGORA</Text>
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
          
          {/* Garantia */}
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
              <MaterialCommunityIcons name="shield-check" size={22} color="#FFD700" />
            </View>
            <Text style={[styles.guaranteeText, { fontFamily: fonts.regular }]}>
              7 dias de garantia de satisfação ou seu dinheiro de volta
            </Text>
          </Animated.View>
          
          {/* Botão de voltar */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }]
            }}
          >
            <TouchableOpacity 
              onPress={() => {
                // Saída com animação
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  confettiAnimation: {
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  proBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  proBadgeMask: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  proBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  heroDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ribbon: {
    position: 'absolute',
    top: 20,
    right: -30,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  ribbonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 6,
  },
  ribbonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  oldPrice: {
    fontSize: 14,
    color: '#ccc',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  price: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFD700',
    lineHeight: 64,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  periodContainer: {
    marginLeft: 4,
    alignSelf: 'center',
  },
  period: {
    fontSize: 16,
    color: '#ccc',
  },
  billingInfo: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 8,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  ctaButton: {
    marginVertical: 8,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  ctaButtonGradient: {
    paddingVertical: 16,
  },
  ctaButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
    guaranteeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  guaranteeText: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    opacity: 0.8,
  },
  backButtonText: {
    color: '#ccc',
    marginLeft: 4,
    fontSize: 14,
  },
  // Estilos para animações de brilho (shimmer)
  shimmerContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Estilos para tablets e telas maiores
  ...(width > 600 && {
    scrollContent: {
      padding: 40,
      paddingBottom: 60,
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    },
    heroTitle: {
      fontSize: 48,
    },
    benefitCard: {
      marginHorizontal: 16,
    },
    pricingCard: {
      marginHorizontal: 16,
    },
  }),
});