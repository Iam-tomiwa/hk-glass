// Query keys for consistent caching
export const queryKeys = {
  comics: {
    all: ["comics"] as const,
    featured: () => [...queryKeys.comics.all, "featured"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.comics.all, "list", { filters }] as const,
    detail: (id: string) => [...queryKeys.comics.all, "detail", id] as const,
    bookmarks: () => [...queryKeys.comics.all, "bookmarks"] as const,
    bookmarkStatus: (comicEpisodeId: number | undefined) =>
      [...queryKeys.comics.all, "bookmark", comicEpisodeId] as const,
    likeStatus: (comicId: string | number | undefined) =>
      [...queryKeys.comics.all, "like", comicId] as const,
    quiz: {
      all: () => [...queryKeys.comics.all, "quiz"] as const,
      questions: (filters: Record<string, unknown>) =>
        [...queryKeys.comics.quiz.all(), "questions", { filters }] as const,
    },
  },

  register: {
    all: ["register"] as const,
    classes: () => [...queryKeys.register.all, "classes"] as const,
    locations: () => [...queryKeys.register.all, "locations"] as const,
  },

  devices: {
    all: ["devices"] as const,
    list: (type: "admin" | "staff") =>
      [...queryKeys.devices.all, type] as const,
  },
};
