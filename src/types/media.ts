export type Media = {
  id: string;
  title: string;
  type: string;
};

export type MediaEntry = {
  id: string;

  status: string;
  rating: number | null;
  progress: number | null;

  media: {
    id: string;
    title: string;
    type: string;
  };
};

export type PaginatedMedia = {
  items: MediaEntry[];
  page: number;
  totalPages: number;
};
