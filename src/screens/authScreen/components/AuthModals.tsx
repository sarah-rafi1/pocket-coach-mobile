import React from 'react';
import { InfoModal } from '../../../components';
import { TickIcon } from '../../../../assets/icons';

interface ModalContent {
  title: string;
  message: string;
  action: () => void;
}

interface AuthModalsProps {
  showSuccessModal: boolean;
  showErrorModal: boolean;
  showConfirmationModal: boolean;
  modalContent: ModalContent;
  onCloseConfirmationModal: () => void;
}

export function AuthModals({
  showSuccessModal,
  showErrorModal,
  showConfirmationModal,
  modalContent,
  onCloseConfirmationModal
}: AuthModalsProps) {
  return (
    <>
      <InfoModal
        visible={showSuccessModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Continue"
        onButtonPress={modalContent.action}
        icon={<TickIcon />}
      />

      <InfoModal
        visible={showErrorModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Try Again"
        onButtonPress={modalContent.action}
      />

      <InfoModal
        visible={showConfirmationModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Verify Email"
        onButtonPress={modalContent.action}
        showCloseButton={true}
        onClose={onCloseConfirmationModal}
      />
    </>
  );
}