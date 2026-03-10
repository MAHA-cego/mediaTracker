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

  async function handleSearch(value: string) {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const data = await apiClientFetch<Media[]>(
      `/api/media?search=${encodeURIComponent(value)}`,
    );

    setResults(data);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search media..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {results.length > 0 && (
        <ul>
          {results.map((media) => (
            <li key={media.id}>
              <button onClick={() => onSelect(media)}>{media.title}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
