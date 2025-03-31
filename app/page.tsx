
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useCompletion } from "ai/react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export default function Page() {
  const {
    input,
    handleInputChange,
    setInput,
    handleSubmit,
    error,
    completion,
    isLoading,
  } = useCompletion({
    api: "/generate",
  });

  const {
    completion: docCompletion,
    handleSubmit: handleDocSearch,
    error: docError,
    isLoading: isDocLoading
  } = useCompletion({
    api: "/doc_search",
  });

  return (
    <div className="flex flex-col gap-8 mb-8">
      <form
        className="flex flex-col sm:flex-row gap-2 relative"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <GitHubLogoIcon className="size-5 text-stone-400" />
        </div>
        <Input
          type="text"
          name="input"
          value={input}
          onChange={handleInputChange}
          required
          disabled={isLoading || isDocLoading}
          placeholder="Enter text"
          className="text-lg rounded-full px-4 pl-12 h-12 transition-all bg-stone-900"
        />
        <div className="flex gap-2">
          <Button
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            disabled={isLoading || isDocLoading}
            className="h-12 rounded-full text-lg font-medium bg-slate-200 text-black transition-colors"
          >
            Generate
          </Button>
          <Button
            size="lg"
            onClick={async (e) => {
              e.preventDefault();
              const response = await fetch('/doc_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
              });
              const data = await response.json();
              console.log('Doc search response:', data);
            }}
            disabled={isLoading}
            className="h-12 rounded-full text-lg font-medium bg-slate-200 text-black transition-colors"
          >
            Search
          </Button>
        </div>
      </form>
      {(isLoading || isDocLoading) && completion.trim() === "" && docCompletion.trim() === "" ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-[550px]" />
          <Skeleton className="h-12 w-[500px]" />
          <Skeleton className="h-12 w-[520px]" />
          <Skeleton className="h-12 w-[480px]" />
        </div>
      ) : error || docError ? (
        <div className="bg-rose-950 px-4 rounded-md py-2 text-base text-rose-200">
          {(error || docError)?.message}
        </div>
      ) : completion || docCompletion ? (
        <div className="text-base prose prose-stone prose-sm prose-invert">
          <Markdown>{completion || docCompletion}</Markdown>
        </div>
      ) : null}
    </div>
  );
}
