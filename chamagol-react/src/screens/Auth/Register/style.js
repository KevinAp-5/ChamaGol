import { StyleSheet } from "react-native";

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
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  titleText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#6D9773",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
  },

  form: {
    width: "100%",
    paddingHorizontal: 20,
  },

  formLabel: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 5,
  },

  input: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    paddingHorizontal: 15,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },

  icon: {
    marginLeft: 10,
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  termsText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 10,
  },

  link: {
    color: "#FFBA00",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    paddingVertical: 14,
    marginTop: 20,
    height: 60
  },

  buttonText: {
    fontSize: 18,
    color: "#FFBA00",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  errorMessageContext: {
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
  },

  errorMessage: {
    color: "red",
    fontWeight: "bold",
  },
});

export default styles;
