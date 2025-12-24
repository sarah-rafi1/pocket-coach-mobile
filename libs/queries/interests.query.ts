import { useQuery } from '@tanstack/react-query';
import { interestsService } from '@/libs/services/interests.service';
import { QUERY_KEYS } from '@/libs/constants/query-keys';

export function useInterestsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.interests.all,
    queryFn: interestsService.getInterests,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
