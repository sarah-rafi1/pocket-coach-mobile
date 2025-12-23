import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '@/libs/stores'
import { font_size, ThemeTypes } from '../constants';
import { BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container]}>
        <View style={{ backgroundColor: theme.white, borderRadius: 12, padding: 4, marginRight: 8, alignItems: "center", justifyContent: "center" }}>
          <Image source={require('../../assets/icon.png')} style={{ height: 40, width: 40, objectFit: 'contain' }} />
        </View>
        <View>
          <Text style={[styles.title, { color: theme.white }]}>{text1}</Text>
          <Text style={[styles.subtitle, { color: theme.white, width: '100%' }]}>{text2}</Text>
        </View>
      </View>
    );
  },
  alert: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container, { width: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }]}>
        <Text style={[styles.title, { color: theme.white }]}>{text1}</Text>
        <Text style={[styles.subtitle, { color: theme.white, textAlign: "center" }]}>{text2}</Text>
      </View>
    );
  }
};

const createStyles = (theme: ThemeTypes) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.dark_1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: '90%',
    marginHorizontal: 16,
    // borderColor: theme.primary,
    // borderWidth: 1
    // shadowColor: theme.primary,
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 5,
  },
  title: {
    fontSize: font_size.M,
    color: theme.white,
  },
  subtitle: {
    fontSize: font_size.S,
    color: theme.gray_2,
    marginBottom: 4,
  }
});
