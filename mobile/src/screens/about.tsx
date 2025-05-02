import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <SafeAreaView>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </SafeAreaView>
      <Text style={[styles.title, { color: colors.primary }]}>
        Sobre a ChamaGol
      </Text>
      <View style={styles.divider} />
      <Text style={[styles.text, { color: colors.primary }]}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor
        eleifend aliquet. Duis malesuada in mi a tristique. Nam suscipit mollis
        libero nec fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing
        elit. Vivamus sed vehicula neque. Nullam ut tincidunt arcu. Sed et
        mollis lacus. Suspendisse ac justo ut nibh fermentum dignissim et nec
        sem. Sed congue nisi ac convallis semper. Morbi justo ligula, fringilla
        ac gravida eu, viverra nec risus.
      </Text>
      <Text style={[styles.text, { color: colors.primary }]}>
        Pellentesque habitant morbi tristique senectus et netus et malesuada
        fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci
        luctus et ultrices posuere cubilia curae; Proin rhoncus, justo ac
        interdum ullamcorper, libero ante interdum eros, sit amet malesuada
        justo nisi sit amet felis. Donec nec vulputate metus, eu tincidunt
        augue.
      </Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>10+</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Lorem
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>5M+</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Usuários</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>20+</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
          Ipsum
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          © 2025 ChamaGol. All Rights Reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  divider: {
    width: "80%",
    height: 2,
    backgroundColor: "#444",
    marginVertical: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 24,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
