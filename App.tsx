import './global.css';
import Navigator from './src';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/configs';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigator />
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}