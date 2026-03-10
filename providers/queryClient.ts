// lib/queryClient.ts
"use client";

import { Query, QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				staleTime: 1000 * 60,
			},
		},
	});
}

// Invalidate all queries that start with the entity's query key prefix
// This will invalidate all queries regardless of their parameters
export const invalidateQuery = (
	query: Query<unknown, Error, unknown, readonly unknown[]>,
	queryKeyPrefix: readonly unknown[]
) => {
	// Check if the query key starts with the entity's prefix
	const queryKey = query.queryKey as unknown[];

	// Filter out null/undefined values from queryKeyPrefix
	const cleanPrefix = queryKeyPrefix.filter(
		(key): key is NonNullable<unknown> => key != null
	);

	// For arrays like ['episodes', 'comic', {...}] or ['episodes', {...}]
	if (Array.isArray(queryKey) && queryKey.length > 0) {
		// Check if the first element matches the first element of our prefix
		if (queryKey[0] === cleanPrefix[0]) {
			// If we have a multi-part prefix like ['episodes', 'episode-image']
			if (cleanPrefix.length > 1 && queryKey.length > 1) {
				return queryKey[1] === cleanPrefix[1];
			}
			return true;
		}
	}
	return false;
};
