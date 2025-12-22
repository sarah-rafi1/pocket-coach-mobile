import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, CreatePostPayload } from '../apis/PostsApis';
import { useApiStore } from '../../store';

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 [CREATE POST MUTATION] Starting post creation with payload:', payload);
        const result = await postsApi.createPost(payload);
        console.log('✅ [CREATE POST MUTATION] Complete response received:', {
          fullResult: result,
          success: result.success,
          timestamp: result.timestamp,
          postData: result.data,
          postId: result.data?.post?.id,
          uploadUrl: result.data?.uploadUrl ? 'included' : 'missing'
        });
        return result;
      } catch (error: any) {
        console.error('❌ [CREATE POST MUTATION] Error in upload process:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to create post';
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      console.log('✅ [CREATE POST MUTATION] Post created with ID:', data.data.post.id);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      setLoading(false);
    },
    onError: (error: any) => {
      console.error('❌ [CREATE POST MUTATION] Final error handler:', error);
      const message = error?.response?.data?.message || error.message || 'Failed to create post';
      setError(message);
      setLoading(false);
    },
  });
};