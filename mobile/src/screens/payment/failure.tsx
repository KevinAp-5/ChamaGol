import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import { useTheme } from '../../theme/theme';
import Logo from "../../components/logo";
import Footer from '../../components/footer';

const PaymentFailureScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
    
    // Run pulse animation for error icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, '#222222']}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.container,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo do ChamaGol no topo */}
          <View style={styles.logoContainer}>
            <Logo source={require("../../assets/logo_white_label.png")} />
            <Text style={[styles.appTitle, { color: colors.secondary, fontFamily: fonts.bold }]}>
              CHAMAGOL
            </Text>
          </View>

          <View 
            style={[
              styles.contentContainer, 
              { 
                backgroundColor: colors.white,
                borderRadius: borderRadius.xl,
                ...shadows.medium
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <LinearGradient
                colors={[colors.error, colors.highlight]}
                style={[
                  styles.statusIcon,
                  { borderRadius: borderRadius.round }
                ]}
              >
                <MaterialCommunityIcons name="close" size={40} color={colors.white} />
              </LinearGradient>
            </Animated.View>
            
            <Text style={[
              styles.title, 
              { 
                color: colors.primary,
                fontFamily: fonts.bold,
                marginBottom: spacing.md
              }
            ]}>
              Falha no pagamento
            </Text>
            
            <Text style={[
              styles.description,
              {
                color: colors.muted,
                fontFamily: fonts.regular,
                marginBottom: spacing.xl
              }
            ]}>
              Infelizmente, o seu pagamento não pôde ser processado.
              Por favor, verifique seus dados e tente novamente.
            </Text>
            
            <Animated.View 
              style={{ 
                width: '100%', 
                transform: [{ scale: buttonScale }]
              }}
            >
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { 
                    backgroundColor: colors.secondary,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md
                  }
                ]}
                onPress={() => navigation.navigate('ProSubscription')}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  {
                    color: colors.white,
                    fontFamily: fonts.bold
                  }
                ]}>
                  TENTAR NOVAMENTE
                </Text>
                <MaterialCommunityIcons name="refresh" size={20} color={colors.white} />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderRadius: borderRadius.lg
                }
              ]}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.secondaryButtonText,
                {
                  color: colors.accent,
                  fontFamily: fonts.semibold
                }
              ]}>
                VOLTAR PARA HOME
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      <Footer></Footer>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: width - 40,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  statusIcon: {
    width: 85,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: 1,
  },
});

export default PaymentFailureScreen;