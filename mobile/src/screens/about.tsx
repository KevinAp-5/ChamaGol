import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/theme";
import { CustomAlertProvider, useCustomAlert } from "../components/CustomAlert";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "About">;

function AboutContent({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const statsAnim = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ])[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();

    Animated.stagger(200, [
      Animated.timing(statsAnim[0], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(statsAnim[1], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(statsAnim[2], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, '#B71C1C']}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
            SOBRE NÓS
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
            Conheça o ChamaGol
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require("../assets/logo.png")} 
              style={styles.logo} 
            />
            <Text style={[styles.appTitle, { color: colors.secondary, fontFamily: fonts.extraBold }]}>
              CHAMAGOL
            </Text>
            <Text style={[styles.tagline, { color: colors.muted, fontFamily: fonts.regular }]}>
              Seu universo esportivo
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={24} 
                color={colors.secondary}
              />
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
                Nossa História
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.secondary }]} />
            
            <Text style={[styles.text, { color: colors.primary, fontFamily: fonts.regular }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor
              eleifend aliquet. Duis malesuada in mi a tristique. Nam suscipit mollis
              libero nec fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Vivamus sed vehicula neque.
            </Text>
            
            <Text style={[styles.text, { color: colors.primary, fontFamily: fonts.regular }]}>
              Pellentesque habitant morbi tristique senectus et netus et malesuada
              fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci
              luctus et ultrices posuere cubilia curae; Proin rhoncus, justo ac
              interdum ullamcorper, libero ante interdum eros.
            </Text>
          </View>

          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.statBox,
                  { 
                    opacity: statsAnim[index],
                    transform: [
                      { 
                        scale: statsAnim[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#E53935', '#B71C1C']}
                  style={styles.statBoxGradient}
                >
                  <Text style={[styles.statNumber, { color: '#FFFFFF', fontFamily: fonts.extraBold }]}>
                    {stat.number}
                  </Text>
                  <Text style={[styles.statLabel, { color: '#FFFFFF', fontFamily: fonts.medium }]}>
                    {stat.label}
                  </Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons 
                name="target" 
                size={24} 
                color={colors.secondary}
              />
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
                Nossa Missão
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.secondary }]} />
            
            <Text style={[styles.text, { color: colors.primary, fontFamily: fonts.regular }]}>
              Donec nec vulputate metus, eu tincidunt augue. Maecenas finibus urna 
              vel purus tempor, vel vehicula magna placerat. Cras vel enim vel massa 
              aliquam iaculis at id quam. Integer placerat ante nec eros volutpat luctus.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.secondary }]}
            activeOpacity={0.8}
            onPress={() => showAlert("Whatsapp: ", {
              title: "Suporte",
              confirmText: "Sair"
            })}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
            <Text style={[styles.contactButtonText, { color: '#FFF', fontFamily: fonts.bold }]}>
              ENTRAR EM CONTATO
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.muted, fontFamily: fonts.regular }]}>
              © 2025 ChamaGol. Todos os direitos reservados.
            </Text>
            <Text style={[styles.versionText, { color: colors.muted, fontFamily: fonts.regular }]}>
              Versão 2.5.1
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default function AboutScreen(props: Props) {
  return (
    <CustomAlertProvider>
      <AboutContent {...props} />
    </CustomAlertProvider>
  );
}

const statsData = [
  { number: "10+", label: "Estados" },
  { number: "5M+", label: "Usuários" },
  { number: "20+", label: "Parceiros" },
];

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientHeader: {
    paddingBottom: 30,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    marginTop: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 8,
  },
  divider: {
    width: '100%',
    height: 2,
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  statBox: {
    width: width / 3.5,
    overflow: 'hidden',
  },
  statBoxGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  contactButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contactButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.6,
  },
});