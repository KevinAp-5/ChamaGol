import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  formContext: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: "#6D9773"
  },

  form: {
    width: "100%",
    marginTop: 30,
    padding: 10,
  },

  formLabel: {
    color: "#000000",
    fontSize: 18,
    paddingLeft: 20,
  },

  input: {
    width: "90%",
    borderRadius: 50,
    backgroundColor: "#f6f6f6",
    height: 40,
    margin: 12,
    paddingLeft: 10
  },

  errorMessage: {
    color: "red"
  },

  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    paddingTop: 14,
    paddingBottom: 14,
    marginLeft: 12,
    marginTop: 30
  },
  buttonText: {
    fontSize: 20,
    color: "#FFBA00",
    justifyContent: "center",
    alignContent: "center"
  },
  forgotPasswordContext: {
    padding: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 30,
    paddingTop: 30
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#000000",
  },
  registerContext: {
    padding: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 0,
  },
  registerText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "bold"
  },
  footer: {
    margin: 30,
    padding: 30
  }
});

export default styles