import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    bottom: 0,
    backgroundColor: "#f6f6f6",
    justifyContent: "center",
    alignItems: "left",
    padding: 16,
  },
  form: {
    width: "100%",
    height: "auto",
    marginBottom: 10,
    padding: 10
  },
  formLabel: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    height: 40,
    margin: 12,
    paddingLeft: 10,
  },
  errorMessage: {
    color: "red"
  },
  validMark: {
    color: "green",
    marginLeft: 5,
    fontSize: 20
  },
  invalidMark: {
    color: "red",
    marginLeft: 5,
    fontSize: 20
  }
});

export default styles