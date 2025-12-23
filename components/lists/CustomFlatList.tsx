import React from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  RefreshControl,
  FlatListProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '@/libs/stores';

/**
 * CustomFlatList is an enhanced FlatList with built-in loading, error, and empty states.
 * Provides a consistent way to display lists with proper handling of various data states.
 * 
 * @example
 * ```tsx
 * <CustomFlatList
 *   data={users}
 *   renderItem={({ item }) => <UserCard user={item} />}
 *   keyExtractor={item => item.id}
 *   loading={isLoading}
 *   error={error}
 *   onRefresh={handleRefresh}
 *   refreshing={isRefreshing}
 *   emptyMessage="No users found"
 * />
 * ```
 * 
 * @param props.data - Array of items to render in the list
 * @param props.renderItem - Function to render each item
 * @param props.keyExtractor - Function to extract a unique key for each item
 * @param props.onEndReached - Function called when end of list is reached
 * @param props.onRefresh - Function called when list is pulled to refresh
 * @param props.refreshing - Whether the list is currently refreshing
 * @param props.loading - Whether initial data is being loaded
 * @param props.loadingMore - Whether additional data is being loaded
 * @param props.error - Error message or null if no error
 * @param props.ListHeaderComponent - Component to render at the top of the list
 * @param props.ListFooterComponent - Component to render at the bottom of the list
 * @param props.ListEmptyComponent - Custom component to render when list is empty
 * @param props.onEndReachedThreshold - How far from the end to trigger onEndReached
 * @param props.contentContainerStyle - Style for the container
 * @param props.numColumns - Number of columns in the list
 * @param props.emptyMessage - Message to display when list is empty
 * @param props.errorMessage - Message to display when an error occurs
 * @param props.textStyle - Style for text elements
 * @param props.showsVerticalScrollIndicator - Whether to show scroll indicator
 * @param props.scrollEnabled - Whether scrolling is enabled
 * @param props.inverted - Whether to invert the direction of the list
 */

type CustomFlatListProps<T> = {
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  onEndReachedThreshold?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  numColumns?: number;
  emptyMessage?: string;
  errorMessage?: string;
  textStyle?: StyleProp<TextStyle>;
  showsVerticalScrollIndicator?: boolean;
  initialNumToRender?: number;
  scrollEnabled?:boolean;
  horizontal?:boolean;
  inverted?:boolean;
};

function CustomFlatList<T>({
  data,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  onEndReached = () => {},
  onRefresh = () => {},
  refreshing = false,
  loading = false,
  loadingMore = false,
  error = null,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReachedThreshold = 0.5,
  contentContainerStyle,
  numColumns = 1,
  emptyMessage = 'No data found.\nPull down to refresh.',
  errorMessage = 'Something went wrong.\nPull down to refresh.',
  textStyle,
  showsVerticalScrollIndicator = false,
  // initialNumToRender = 10,
  scrollEnabled=true,
  inverted=false,
  ...props
}: CustomFlatListProps<T>) {
  const theme = useThemeStore((state) => state.theme);

  const showInitialLoading = loading && data.length === 0;
  const showEmptyComponent = !loading && data.length === 0 && !error;
  const showErrorComponent = !loading && !!error && data.length === 0;
  const showListFooter = loadingMore && data.length > 0;

  const defaultLoadingComponent = (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );

  const defaultEmptyComponent = (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={[{ textAlign: 'center', color: '#888' }, textStyle]}>
        {emptyMessage}
      </Text>
    </View>
  );

  const defaultErrorComponent = (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={[{ textAlign: 'center', color: '#888' }, textStyle]}>
        {typeof error === 'string' ? error : errorMessage}
      </Text>
    </View>
  );

  const defaultFooterComponent = (
    <View style={{ padding: 10, alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      numColumns={numColumns}
      scrollEnabled={scrollEnabled}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        showListFooter ? ListFooterComponent || defaultFooterComponent : null
      }
      ListEmptyComponent={
        showInitialLoading ?
          defaultLoadingComponent
          : showEmptyComponent ? 
              ListEmptyComponent || defaultEmptyComponent
              : showErrorComponent ? 
                defaultErrorComponent
                : null
      }
      contentContainerStyle={[
        contentContainerStyle,
        data.length === 0 ? { flexGrow: 1 } : null,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      inverted={inverted}
      {...props}
      // initialNumToRender={initialNumToRender}
    />
  );
}

export { CustomFlatList };
