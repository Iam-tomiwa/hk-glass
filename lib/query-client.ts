import { isServer, QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Stale time for comic data (5 minutes)
				staleTime: 5 * 60 * 1000,
				// Cache time for comic data (30 minutes)
				gcTime: 30 * 60 * 1000,
				// Retry failed requests 2 times
				retry: 2,
				// Refetch on window focus for fresh data
				refetchOnWindowFocus: true,
				// Don't refetch on reconnect for better UX
				refetchOnReconnect: false,
			},
			mutations: {
				// Retry mutations once
				retry: 1,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) {
		// Server: always make a new query client
		return createQueryClient();
	} else {
		// Browser: make a new query client if we don't already have one
		// This is very important, so we don't re-make a new client if React
		// suspends during the initial render. This may not be needed if we
		// have a suspense boundary BELOW the creation of the query client
		if (!browserQueryClient) browserQueryClient = createQueryClient();
		return browserQueryClient;
	}
}

const queryClient = getQueryClient();

export default queryClient;
