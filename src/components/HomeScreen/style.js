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
    justifyContent: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    justifyContent: "center",
    alignItems: "center",
    color: "#6D9773",
    marginBottom: 50,
  },

  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    paddingVertical: 14,
    marginTop: 11
  },

  buttonLoginText: {
    fontSize: 20,
    color: "#FFBA00",
  },

  buttonRegisterText: {
    fontSize: 20,
    color: "#FFFFFF",
    justifyContent: "center",
    alignContent: "center"
  },

  footer: {
    fontSize: 18,
    fontStyle: 'italic',
    alignItems: "center",
    marginVertical: 40,
    paddingTop: 10,
    color: "#000000"
  }
});

export default styles