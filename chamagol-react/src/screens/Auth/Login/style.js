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

  // Caso utilize alguma imagem no topo, pode manter ou ajustar conforme necessário
  topImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },

  titleText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#6D9773",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
  },

  // Se necessário, subtítulo ou mensagem adicional pode ser ajustado
  subtitleText: {
    fontSize: 16,
    color: "#6D9773",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
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

  icon: {
    marginLeft: 10,
  },

  errorMessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    // Se desejar, ajuste a margem inferior conforme sua necessidade
    marginBottom: 10,
  },

  errorMessage: {
    color: "red",
    fontWeight: "bold",
  },

  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#0C3B2E",
    paddingVertical: 14,
    marginTop: 20,
    height: 60,
  },

  buttonText: {
    fontSize: 18,
    color: "#FFBA00",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default styles;
