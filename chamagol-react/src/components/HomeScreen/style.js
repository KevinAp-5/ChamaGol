import { StyleSheet, Dimensions } from "react-native";
const ScreenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C3B2E",
    paddingTop: 20,
  },
  formContext: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6D9773",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: ScreenWidth * 0.9,
    paddingVertical: 15,
    marginVertical: 10,
  },
  buttonLoginText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonRegisterText: {
    fontSize: 20,
    color: "#0C3B2E",
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
  },
  footerText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#000000",
  },
});

export default styles;
