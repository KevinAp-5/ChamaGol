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
  },

  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6D9773",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    height: 50,
    marginVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#000000",
  },

  confirmationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },

  confirmationIcon: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },

  confirmationText: {
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFBA00",
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },

  errorMessage: {
    color: "red",
    fontSize: 14,
    marginVertical: 10,
  },

  resetPasswordContext: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  resetPasswordText: {
    fontSize: 18,
    color: "#6D9773",
    textAlign: "center",
  },

  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  
  subtitleText: {
    fontSize: 18,
    color: "#6D9773",
    textAlign: "center",
    marginBottom: 20,
  },
  
  messageText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  
  tipText: {
    fontSize: 15,
    color: "#000000",
    textAlign: "center",
    marginTop: 20,
  },
  
});

export default styles;
