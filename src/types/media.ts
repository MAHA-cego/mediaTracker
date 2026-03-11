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
