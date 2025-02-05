import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  ...require('../Register/style').default, // Extend existing styles
  
  confirmationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "90%"
  },

  confirmationText: {
    textAlign: 'center',
    fontSize: 18,
    color: "#000000",
    marginVertical: 30,
    paddingHorizontal: 20,
  },

  iconContainer: {
    width: 150,
    height: 150,
    backgroundColor: "#0C3B2E",
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },

  confirmationIcon: {
    width: 100,
    height: 100,
    tintColor: "",
    marginLeft: 14
  },
});

export default styles;