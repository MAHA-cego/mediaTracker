"use client";

import { useRef, useState } from "react";
import { apiClientFetch } from "@/lib/api-client";
import type { Media } from "@/types/media";

type Props = {
  onSelect: (media: Media) => void;
};

export default function MediaSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSearch(value: string) {
    setQuery(value);

    abortRef.current?.abort();

    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    abortRef.current = new AbortController();
    setLoading(true);
    setResults([]);

    try {
      const data = await apiClientFetch<Media[]>(
        `/api/media?search=${encodeURIComponent(value)}`,
        { signal: abortRef.current.signal },
      );

      setResults(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!query.trim()) return;

    const media = await apiClientFetch<Media>("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: query.trim(),
        type: "MOVIE",
      }),
    });

    onSelect(media);
  }

  const exactMatch = results.some(
    (m) => m.title.toLowerCase() === query.toLowerCase(),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search media..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading && <p>Searching...</p>}

      <ul>
        {results.map((media) => (
          <li key={media.id}>
            <button onClick={() => onSelect(media)}>{media.title}</button>
          </li>
        ))}

        {query.length >= 2 && !exactMatch && (
          <li>
            <button onClick={handleCreate}>Create "{query}"</button>
          </li>
        )}
      </ul>
    </div>
  );
}
