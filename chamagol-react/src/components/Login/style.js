import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C3B2E",
    paddingTop: 0,
  },

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
    color: "#6D9773",
    marginBottom: 20,
  },

  form: {
    width: "100%",
    padding: 10,
  },

  formLabel: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
    paddingLeft: 20,
    paddingVertical: 10
  },

  input: {
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    height: 50,
    margin: 12,
    paddingLeft: 20,
    paddingRight: 20,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    height: 50,
    margin: 12,
  },

  passwordInput: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 45,
  },

  icon: {
    position: 'absolute',
    right: 10,  // Coloca o ícone no lado direito
    padding: 10,
  },

  errorMessage: {
    color: "red",
    marginBottom: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    height: 60
  },

  buttonText: {
    fontSize: 20,
    color: "#FFBA00",
    justifyContent: "center",
    alignContent: "center",
  },

  resetPasswordContext: {
    padding: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 10,
  },

  resetPasswordText: {
    fontStyle: "italic",
    fontSize: 17,
    color: "#000000",
  },

  registerContext: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  registerText: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "bold",
  },
});

export default styles;
