import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Linking,
  StatusBar,
  Platform
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../theme/theme';

type RootStackParamList = {
  Home: undefined;
  PROBenefits: undefined;
};

const PaymentSuccessScreen = () => {
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  
  useEffect(() => {
    // Executar animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Iniciar animação Lottie
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 200);
    }
  }, []);
  
  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true
    }).start();
  };

  const handleSupport = () => {
    Linking.openURL('https://chamagol.com/suporte');
  };

  const handleExploreFeatures = () => {
    navigation.navigate('PROBenefits');
  };

  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, '#222222']}
        style={styles.gradientBackground}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo_white_label.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          {/* <Text style={[styles.logoText, { color: colors.secondary, fontFamily: fonts.bold }]}>
            CHAMAGOL
          </Text> */}
        </View>
        
        {/* Conteúdo Principal */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              backgroundColor: colors.background,
              ...shadows.large,
              opacity: fadeAnim,
              transform: [
                { translateY: translateY },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Ícone de sucesso animado */}
          <View style={styles.successIconWrapper}>
            <LinearGradient
              colors={[colors.secondary, colors.accent]}
              style={styles.successIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.successIconInner}>
                <LottieView
                  ref={lottieRef}
                  source={require('../../assets/success-checkmark.json')}
                  style={styles.lottieAnimation}
                  autoPlay={false}
                  loop={true}
                />
              </View>
            </LinearGradient>
            
            {/* Badge PRO */}
            <View style={styles.proBadgePosition}>
              <LinearGradient
                colors={[colors.accent, colors.secondary]}
                style={styles.proBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.proBadgeText, { fontFamily: fonts.extraBold }]}>PRO</Text>
              </LinearGradient>
            </View>
          </View>
          
          <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
            PAGAMENTO APROVADO!
          </Text>
          
          <View style={styles.divider}>
            <LinearGradient
              colors={[colors.accent, colors.secondary]}
              style={styles.dividerLine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          
          <Text style={[styles.subtitle, { color: colors.highlight, fontFamily: fonts.semibold }]}>
            Sua conta agora é PRO!
          </Text>
          
          <Text style={[styles.description, { color: colors.muted, fontFamily: fonts.regular }]}>
            Parabéns! Você acaba de desbloquear todos os recursos exclusivos do ChamaGol. 
            Aproveite análises avançadas, estatísticas em tempo real e muito mais.
          </Text>
          
          {/* Lista de benefícios */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="trophy-outline" size={22} color={colors.accent} />
              <Text style={[styles.benefitText, { color: colors.primary, fontFamily: fonts.medium }]}>
                Análises táticas exclusivas
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="graph" size={22} color={colors.accent} />
              <Text style={[styles.benefitText, { color: colors.primary, fontFamily: fonts.medium }]}>
                Estatísticas avançadas em tempo real
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="bell-ring-outline" size={22} color={colors.accent} />
              <Text style={[styles.benefitText, { color: colors.primary, fontFamily: fonts.medium }]}>
                Alertas personalizados de jogos
              </Text>
            </View>
          </View>
          
          {/* Botões de ação */}
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.secondary }]}
                onPress={() => navigation.navigate("Home")}
                activeOpacity={0.8}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Text style={[styles.primaryButtonText, { color: colors.white, fontFamily: fonts.bold }]}>
                  IR PARA O APP
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.white} />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleExploreFeatures}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.accent, fontFamily: fonts.semibold }]}>
                EXPLORAR RECURSOS PRO
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleSupport}
              activeOpacity={0.7}
            >
              <Text style={[styles.supportButtonText, { color: colors.muted, fontFamily: fonts.medium }]}>
                Precisa de ajuda?
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.regular }]}>
            © {currentYear} ChamaGol • Todos os direitos reservados
          </Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="instagram" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="facebook" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="twitter" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    marginBottom: 0,
  },
  logo: {
    width: 150,
    height: 150,
  },
  logoText: {
    fontSize: 20,
    letterSpacing: 1,
    marginTop: 4,
  },
  contentContainer: {
    width: width * 0.9,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
  },
  successIconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  successIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3, // Borda gradiente
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottieAnimation: {
    width: 130,
    height: 130,
  },
  proBadgePosition: {
    position: 'absolute',
    right: -10,
    bottom: -5,
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    width: '60%',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    height: 3,
    width: '100%',
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
  supportButton: {
    paddingVertical: 8,
  },
  supportButtonText: {
    fontSize: 13,
  },
  footer: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginBottom: 8,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    marginHorizontal: 12,
    padding: 8,
  },
});

export default PaymentSuccessScreen;