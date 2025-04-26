import { createFileRoute, Link } from '@tanstack/react-router';
import { useInfiniteQuery, useQuery, type QueryFunctionContext, type InfiniteData } from '@tanstack/react-query';
import React from 'react';

export const Route = createFileRoute('/dashboard/demo/tanstack-query')({
  component: TanStackQueryDemo,
});

const PAGE_SIZE = 10;
const MAX_STORIES = 500;

type Story = {
  id: number;
  title: string;
  by: string;
  url?: string;
  score: number;
};
type PageData = { stories: Story[]; page: number };

async function fetchTopStoryIds() {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const ids: number[] = await res.json();
  return ids.slice(0, MAX_STORIES);
}

async function fetchStories(ids: number[]): Promise<Story[]> {
  const stories = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return res.json();
    })
  );
  return stories;
}

function TanStackQueryDemo() {
  // 1. Fetch and cache the IDs
  const { data: ids, isLoading: idsLoading, error: idsError } = useQuery<number[], Error>({
    queryKey: ['top-story-ids'],
    queryFn: fetchTopStoryIds,
  });

  // 2. Only run infinite query if IDs are loaded
  const {
    data: storyPages,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PageData, Error, InfiniteData<PageData, number>, [string, number[]], number>({
    queryKey: ['top-stories', ids ?? []],
    queryFn: async (context: QueryFunctionContext<[string, number[]], number>) => {
      const pageParam = context.pageParam ?? 0;
      if (!ids) throw new Error("No IDs loaded");
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const batchIds = ids.slice(start, end);
      const stories = await fetchStories(batchIds);
      return { stories, page: pageParam };
    },
    getNextPageParam: (lastPage: PageData) => {
      const nextPage = lastPage.page + 1;
      return nextPage * PAGE_SIZE < MAX_STORIES ? nextPage : undefined;
    },
    initialPageParam: 0,
    enabled: !!ids,
  });

  // 3. Handle loading/error states for IDs
  if (idsLoading) return <div>Loading IDs...</div>;
  if (idsError) return <div>Error loading IDs: {idsError.message}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center text-orange-600">Top Stories</h1>
      </header>
      {isLoading && <div className="text-center">Loading...</div>}
      {isError && <div className="text-center text-red-500">Error: {error?.message}</div>}
      {storyPages?.pages.map((pageData, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {pageData.stories.map((story) => (
            <Link
              key={story.id}
              to="/story/$storyId"
              params={{ storyId: story.id.toString() }}
              className="block p-4 mb-4 bg-white rounded shadow hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold mb-1">{story.title}</h2>
              <div className="text-sm text-gray-600">
                <span>by {story.by}</span> | <span>{story.score} points</span>
              </div>
            </Link>
          ))}
        </React.Fragment>
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50 mt-6 w-full"
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
