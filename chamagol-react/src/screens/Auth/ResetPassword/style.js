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
  topImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6D9773",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#6D9773",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
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
    paddingVertical: 10,
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
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    height: 50,
    margin: 12,
  },
  icon: {
    position: "absolute",
    right: 10,
    padding: 10,
  },
  errorMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    paddingVertical: 14,
    marginTop: 30,
    height: 60
  },
  buttonText: {
    fontSize: 20,
    color: "#FFBA00",
  },
});

export default styles;
