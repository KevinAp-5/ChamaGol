import { StyleSheet } from 'react-native';
import colors from '../../../constants/colors';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: colors.gray,
    borderRadius: 8,
    marginVertical: 8,
  },
  time: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 16,
  },
  text: {
    color: colors.textDark,
    marginVertical: 4,
  }
});