import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#e0e5e5',
    backgroundColor: "#0C3B2E",
    paddingTop: 0,
  },

  formContext: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 400,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    justifyContent: "center",
    alignItems: "center",
    color: "#6D9773",
    marginBottom: 50,
    marginTop: 10,
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
    fontSize: 13,
    alignItems: "center",
    marginVertical: 40,
    color: "#000000"
  }
});

export default styles