import { View, Modal, StyleSheet, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@/libs/stores';
import { ThemeTypes } from '@/libs/constants';

/**
 * Overlay displays content in a modal that slides up from the bottom of the screen.
 * Includes a semi-transparent backdrop that can be tapped to dismiss the overlay.
 * 
 * @example
 * ```tsx
 * const [overlayStatus, setOverlayStatus] = useState('close');
 * 
 * <Button onPress={() => setOverlayStatus('open')} title="Open Overlay" />
 * 
 * <Overlay 
 *   visibilityStatus={overlayStatus}
 *   setVisibilityStatus={setOverlayStatus}
 * >
 *   <Text>This is the overlay content</Text>
 * </Overlay>
 * ```
 * 
 * @param props.children - Content to display inside the overlay
 * @param props.visibilityStatus - Current status: 'open' or 'close'
 * @param props.setVisibilityStatus - Function to update the visibility status
 * @param props.outerContainerStyles - Custom styles for the overlay container
 * @param props.showBar - Whether to show the drag indicator bar (default: true)
 */

interface OverlayProps {
  children: React.ReactNode;
  visibilityStatus: string;
  setVisibilityStatus?: React.Dispatch<React.SetStateAction<string>>;
  outerContainerStyles?: object;
  showBar?: boolean;
}

export function Overlay({
  children,
  visibilityStatus,
  setVisibilityStatus,
  outerContainerStyles = {},
  showBar = true
}: OverlayProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current; // Start off-screen
  const theme = useThemeStore((state) => state.theme);
  const styles = createStyles(theme);

  useEffect(() => {
    if (visibilityStatus === 'open') {
      openOverlay();
    } else if (visibilityStatus === 'close') {
      closeOverlay();
    }
  }, [visibilityStatus]);

  const openOverlay = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeOverlay = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setVisibilityStatus?.('close');
    });
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={closeOverlay}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.overlay,
          outerContainerStyles,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {showBar && <View style={{ height: 4, width: 44, backgroundColor: theme.gray_1, borderRadius: 2, alignSelf: 'center' }}></View>}

        {children}
      </Animated.View>
    </Modal>
  );
}

const createStyles = (theme: ThemeTypes) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      // top: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      backgroundColor: theme.dark_1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      // borderWidth: 2, borderColor: 'red'
      // padding: 20,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  });
