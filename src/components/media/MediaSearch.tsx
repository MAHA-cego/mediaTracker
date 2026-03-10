"use client";

import { useState } from "react";
import { apiClientFetch } from "@/lib/api-client";

type Media = {
  id: string;
  title: string;
};

type Props = {
  onSelect: (media: Media) => void;
};

export default function MediaSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const data = await apiClientFetch<Media[]>(
        `/api/media?search=${encodeURIComponent(value)}`,
      );

      setResults(data);
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
