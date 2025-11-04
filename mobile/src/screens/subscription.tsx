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
  Platform,
} from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/Api';
import { CustomAlertProvider, useCustomAlert } from '../components/CustomAlert';
import { StatusBar } from 'expo-status-bar';

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
  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();
  
  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSale, setIsLoadingSale] = useState(true);
  const [error, setError] = useState('');
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  
  // Valores padrão
  const defaultPrice = 29.90;
  const defaultOldPrice = 39.90;
  const defaultSubscriptionTime = 30;
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const successSlideAnim = useRef(new Animated.Value(-100)).current;
  const successOpacityAnim = useRef(new Animated.Value(0)).current;

  // Calcula tempo restante
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

  // Busca dados da oferta
  const fetchActiveSale = async () => {
    try {
      setIsLoadingSale(true);
      const response = await api.get('sale');
      
      if (response.status === 200) {
        setSaleData(response.data);
        
        if (response.data.saleExpiration) {
          const remaining = calculateTimeRemaining(response.data.saleExpiration);
          setTimeRemaining(remaining);
        }
      }
    } catch (err) {
      console.log('Nenhuma oferta ativa, usando valores padrão');
      setSaleData(null);
    } finally {
      setIsLoadingSale(false);
    }
  };

  // Atualiza countdown
  useEffect(() => {
    if (saleData?.saleExpiration) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(saleData.saleExpiration!);
        setTimeRemaining(remaining);
        
        if (remaining.total <= 0) {
          fetchActiveSale();
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [saleData]);

  // Animação de entrada
  const startEntryAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animação de sucesso
  const showSuccessAnimation = () => {
    setShowSuccess(true);
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(successSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2500),
      Animated.parallel([
        Animated.timing(successSlideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSuccess(false);
      successSlideAnim.setValue(-100);
      successOpacityAnim.setValue(0);
    });
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    fetchActiveSale();
    startEntryAnimation();

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    
    if (url.includes('success')) {
      showSuccessAnimation();
      showAlert(
        `Parabéns! Seu acesso VIP de ${saleData?.userSubscriptionTime || defaultSubscriptionTime} dias foi ativado com sucesso!`,
        { title: 'Pagamento Aprovado' }
      );
    } else if (url.includes('failure')) {
      showAlert(
        'Houve um problema ao processar seu pagamento. Tente novamente.',
        { title: 'Pagamento Não Concluído' }
      );
    } else if (url.includes('pending')) {
      showAlert(
        'Seu pagamento está em análise. Aguarde a aprovação.',
        { title: 'Pagamento Pendente' }
      );
    }
  };

  const handleSubscription = async () => {
    // Animação do botão
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
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

  // Dados da oferta atual
  const currentPrice = saleData?.salePrice || defaultPrice;
  const subscriptionDays = saleData?.userSubscriptionTime || defaultSubscriptionTime;
  const remainingSlots = saleData && !saleData.userUnlimited 
    ? saleData.userAmount - saleData.usedAmount 
    : null;
  const hasTimeLimit = !!saleData?.saleExpiration && timeRemaining && timeRemaining.total > 0;
  const hasUserLimit = remainingSlots !== null && remainingSlots > 0;

  if (isLoadingSale) {
    return (
      <LinearGradient
        colors={['#000000', '#0a0a0a', '#000000']}
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
      colors={['#000000', '#0a0a0a', '#000000']}
      style={styles.container}
    >
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Toast de Sucesso */}
          {showSuccess && (
            <Animated.View 
              style={[
                styles.successToast,
                {
                  opacity: successOpacityAnim,
                  transform: [{ translateY: successSlideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['#34C759', '#28a745']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successToastGradient}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                <Text style={[styles.successToastText, { fontFamily: fonts.bold }]}>
                  Pagamento aprovado! Acesso VIP ativado
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Header Compacto */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.logoGradient}
              >
                <MaterialCommunityIcons name="crown" size={32} color="#000" />
              </LinearGradient>
            </View>
            
            <LinearGradient
              colors={['#FFD700', '#FFED4E', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBadge}
            >
              <Text style={[styles.proBadgeText, { fontFamily: fonts.extraBold }]}>
                ACESSO VIP
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Hero Statement */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={[styles.heroTitle, { fontFamily: fonts.extraBold }]}>
              Maximize Seus{'\n'}
              <Text style={{ color: '#FFD700' }}>Resultados</Text>
            </Text>
            <Text style={[styles.heroSubtitle, { fontFamily: fonts.regular }]}>
              Acesso premium com tudo que você precisa para vencer
            </Text>
          </Animated.View>

          {/* Urgência Sutil */}
          {(hasTimeLimit || hasUserLimit) && (
            <Animated.View 
              style={[
                styles.urgencyContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {hasTimeLimit && timeRemaining && (
                <View style={styles.urgencyBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#FF3B30" />
                  <Text style={[styles.urgencyText, { fontFamily: fonts.semibold }]}>
                    Termina em {timeRemaining.hours}h {timeRemaining.minutes}m
                  </Text>
                </View>
              )}
              {hasUserLimit && remainingSlots && (
                <View style={styles.urgencyBadge}>
                  <MaterialCommunityIcons name="account-group" size={14} color="#FF3B30" />
                  <Text style={[styles.urgencyText, { fontFamily: fonts.semibold }]}>
                    {remainingSlots} {remainingSlots === 1 ? 'vaga restante' : 'vagas restantes'}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Card de Preço DOMINANTE */}
          <Animated.View 
            style={[
              styles.pricingSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Ribbon */}
            {saleData && (
              <View style={styles.ribbon}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ribbonGradient}
                >
                  <Text style={[styles.ribbonText, { fontFamily: fonts.bold }]}>
                    OFERTA ESPECIAL
                  </Text>
                </LinearGradient>
              </View>
            )}

            <LinearGradient
              colors={['rgba(26, 26, 26, 0.95)', 'rgba(15, 15, 15, 0.95)']}
              style={styles.pricingCard}
            >
              {/* Preço */}
              <View style={styles.priceContainer}>
                {saleData && (
                  <Text style={[styles.oldPrice, { fontFamily: fonts.regular }]}>
                    DE R${defaultOldPrice.toFixed(2)}
                  </Text>
                )}
                
                <View style={styles.currentPriceRow}>
                  <Text style={[styles.currency, { fontFamily: fonts.bold }]}>R$</Text>
                  <Text style={[styles.price, { fontFamily: fonts.extraBold }]}>
                    {currentPrice.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.subscriptionInfo}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#FFD700" />
                  <Text style={[styles.subscriptionDays, { fontFamily: fonts.semibold }]}>
                    {subscriptionDays} dias de acesso VIP
                  </Text>
                </View>
              </View>

              {/* CTA GIGANTE */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleSubscription}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFED4E', '#FFD700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <View style={styles.ctaButtonContent}>
                        <MaterialCommunityIcons name="rocket-launch" size={20} color="#000" />
                        <Text style={[styles.ctaButtonText, { fontFamily: fonts.extraBold }]}>
                          GARANTIR ACESSO VIP AGORA
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {error ? (
                <Text style={[styles.errorText, { fontFamily: fonts.medium }]}>{error}</Text>
              ) : null}

              {/* Info Pagamento */}
              <View style={styles.paymentInfo}>
                <View style={styles.paymentRow}>
                  <View style={styles.pixDot} />
                  <Text style={[styles.paymentText, { fontFamily: fonts.regular }]}>
                    Pagamento via PIX
                  </Text>
                  <View style={styles.separator} />
                  <Text style={[styles.paymentText, { fontFamily: fonts.regular }]}>
                    Acesso imediato
                  </Text>
                </View>
                <View style={styles.mercadoPagoRow}>
                  <Text style={[styles.secureText, { fontFamily: fonts.regular }]}>
                    Pagamento seguro com{' '}
                  </Text>
                  <Text style={[styles.mercadoPagoText, { fontFamily: fonts.bold }]}>
                    Mercado Pago
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Benefícios Compactos */}
          <Animated.View 
            style={[
              styles.benefitsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {[
              { icon: 'signal-variant', text: 'Sinais VIP' },
              { icon: 'lightning-bolt', text: 'Alertas Tempo Real' },
              { icon: 'chart-line', text: 'Análises Avançadas' },
              { icon: 'headset', text: 'Suporte Priority' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 165, 0, 0.05)']}
                  style={styles.benefitIconContainer}
                >
                  <MaterialCommunityIcons 
                    name={benefit.icon as any} 
                    size={20} 
                    color="#FFD700" 
                  />
                </LinearGradient>
                <Text style={[styles.benefitText, { fontFamily: fonts.semibold }]}>
                  {benefit.text}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* O que está incluído */}
          <Animated.View 
            style={[
              styles.includedSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.includedCard}>
              {[
                'Sinais exclusivos com alta taxa de acerto',
                'Notificações prioritárias em tempo real',
                'Análises e estatísticas avançadas',
                'Suporte dedicado e prioritário'
              ].map((item, index) => (
                <View key={index} style={styles.includedRow}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={16} 
                    color="#FFD700" 
                  />
                  <Text style={[styles.includedText, { fontFamily: fonts.regular }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Garantia */}
          <Animated.View 
            style={[
              styles.guaranteeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.guaranteeBadge}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#FFD700" />
            </View>
            <Text style={[styles.guaranteeText, { fontFamily: fonts.regular }]}>
              7 dias de garantia ou seu dinheiro de volta
            </Text>
          </Animated.View>

          {/* Botão Voltar */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={16} color="#666" />
            <Text style={[styles.backButtonText, { fontFamily: fonts.regular }]}>
              Voltar
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
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
  
  // Success Toast
  successToast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successToastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  successToastText: {
    fontSize: 14,
    color: '#FFF',
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  proBadgeText: {
    fontSize: 14,
    color: '#000',
    letterSpacing: 1.5,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Urgência
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgencyText: {
    fontSize: 12,
    color: '#FF3B30',
  },

  // Pricing
  pricingSection: {
    width: '100%',
    marginBottom: 24,
  },
  ribbon: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    zIndex: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ribbonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  ribbonText: {
    fontSize: 11,
    color: '#000',
    letterSpacing: 1,
  },
  pricingCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  oldPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  currency: {
    fontSize: 24,
    color: '#FFD700',
    marginRight: 4,
  },
  price: {
    fontSize: 56,
    color: '#FFD700',
    lineHeight: 56,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  subscriptionDays: {
    fontSize: 14,
    color: '#FFD700',
  },

  // CTA Button
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Payment Info
  paymentInfo: {
    alignItems: 'center',
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pixDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#32BCAD',
  },
  paymentText: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  mercadoPagoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureText: {
    fontSize: 11,
    color: '#666',
  },
  mercadoPagoText: {
    fontSize: 11,
    color: '#009EE3',
  },

  // Benefits Grid
  benefitsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
  },

  // Included Section
  includedSection: {
    width: '100%',
    marginBottom: 24,
  },
  includedCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  includedText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },

  // Guarantee
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  guaranteeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeText: {
    fontSize: 13,
    color: '#999',
    maxWidth: 240,
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },
});