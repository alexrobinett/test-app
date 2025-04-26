// src/routes/story.$storyId.tsx

import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

// --- Types ---
interface Story {
  id: number;
  title: string;
  by: string;
  score: number;
  url?: string;
  time: number;
  descendants?: number;
  kids?: number[]; // Array of top-level comment IDs
  text?: string; // Story text (for Ask HN, etc.)
}

interface Comment {
  id: number;
  by?: string;
  kids?: number[];
  parent: number;
  text?: string;
  time: number;
  type: 'comment';
  deleted?: boolean;
  dead?: boolean;
}

// --- API Fetch Functions ---
const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

async function fetchItem<T>(itemId: number): Promise<T> {
  const response = await fetch(`${HN_API_BASE}/item/${itemId}.json`);
  if (!response.ok) {
    throw new Error(`Network response was not ok for item ${itemId}`);
  }
  const data = await response.json();
  if (data === null) {
    // Handle cases where an item might have been deleted but ID still exists in 'kids' array
    throw new Error(`Item ${itemId} not found or is null.`);
  }
  return data;
}

// Wrapper for fetching a story
function fetchStory(storyId: number): Promise<Story> {
  return fetchItem<Story>(storyId);
}

// --- Components ---

// Component to display a single comment and its children recursively
function CommentItem({ commentId }: { commentId: number }) {
  const { data: comment, isLoading, isError, error } = useQuery<Comment, Error>({
    queryKey: ['comment', commentId],
    queryFn: () => fetchItem<Comment>(commentId),
    staleTime: 5 * 60 * 1000, // Cache comments for 5 minutes
  });

  if (isLoading) {
    return <div className="ml-4 pl-4 border-l border-gray-200 py-2 text-sm text-gray-400">Loading comment...</div>;
  }

  // Handle error or deleted/dead comments gracefully
  if (isError || !comment || comment.deleted || comment.dead) {
    return <div className="ml-4 pl-4 border-l border-gray-200 py-2 text-sm text-gray-400">[comment deleted or unavailable]</div>;
  }

  return (
    <div className="ml-4 pl-4 border-l border-gray-300 py-3 space-y-2">
      <div className="text-xs text-gray-500">
        by {comment.by || 'unknown'} | {new Date(comment.time * 1000).toLocaleString()}
      </div>
      {/* Render comment HTML content */}
      {comment.text && (
        <div
          className="text-sm text-gray-800 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
      )}
      {/* Recursively render child comments */}
      {comment.kids && comment.kids.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.kids.map((kidId) => (
            <CommentItem key={kidId} commentId={kidId} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/story/$storyId')({
  component: StoryDetail,
});

function StoryDetail() {
  const { storyId } = useParams({ from: '/story/$storyId' });
  const numericStoryId = parseInt(storyId, 10); // Ensure ID is a number

  const { data: story, isLoading, isError, error } = useQuery<Story, Error>({
    queryKey: ['story', numericStoryId],
    queryFn: () => fetchStory(numericStoryId),
    enabled: !isNaN(numericStoryId), // Only run query if ID is a valid number
  });

  if (isNaN(numericStoryId)) {
    return <div className="p-4 text-red-600">Invalid Story ID</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-600">Error fetching story: {error.message}</div>;
  }

  if (!story) {
    return <div className="p-4">Story not found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-md space-y-6 my-8">
      {/* Story Header */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h1>
        <div className="text-sm text-gray-500 flex items-center space-x-2">
          <span>by {story.by}</span>
          <span>|</span>
          <span>{story.score} points</span>
          <span>|</span>
          <span>{new Date(story.time * 1000).toLocaleString()}</span>
          <span>|</span>
          <span>{story.descendants ?? 0} comments</span>
        </div>
        {story.url && (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all text-sm mt-2 block"
          >
            {story.url}
          </a>
        )}
        {/* Render story text if present (e.g., Ask HN) */}
        {story.text && (
           <div
             className="mt-4 text-gray-800 prose prose-sm max-w-none"
             dangerouslySetInnerHTML={{ __html: story.text }}
           />
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
        {(story.kids && story.kids.length > 0) ? (
          story.kids.map((commentId) => (
            <CommentItem key={commentId} commentId={commentId} />
          ))
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>

      {/* Back Link */}
      <div className="pt-4 border-t mt-6">
        <Link
          to="/dashboard/demo/tanstack-query"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Story List
        </Link>
      </div>
    </div>
  );
}
