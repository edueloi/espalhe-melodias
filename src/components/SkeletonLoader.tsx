import React from 'react';

export function BlogPostSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand animate-pulse">
      <div className="w-full h-48 bg-slate-200" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-6 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="h-3 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-brand-sand shadow-sm overflow-hidden hover:shadow-md transition animate-pulse">
      <div className="flex items-stretch">
        <div className="bg-slate-200 border-r border-brand-sand px-6 flex flex-col items-center justify-center min-w-[80px] h-24" />
        <div className="p-6 flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-6 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded w-28 mt-3" />
        </div>
      </div>
    </div>
  );
}

export function InstagramPostSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md bg-slate-200 aspect-square animate-pulse" />
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-sand animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-3 bg-slate-200 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function StorySkeletons() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-40 w-28 bg-slate-200 rounded-2xl flex-shrink-0 animate-pulse"
        />
      ))}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <BlogPostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
