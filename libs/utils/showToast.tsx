import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'alert';

export const showToast = (
  type: ToastType = 'success',
  text1: string = 'Hello',
  text2?: string
) => {
  Toast.hide();
  Toast.show({
    type,
    text1,
    text2,
    // visibilityTime: 100000
  });
};
