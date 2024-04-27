// Define the type for a book
export interface Book {
  title: string;
  authors: string;
  ISBN: string;
  publisher: string;
  publishedDate: string;
  genre: string;
  language: string[];
  summary: string;
  id: string;
  [key: string]: any; // Define an index signature to allow access to any properties
}
export interface Fields {
  title?: string;
  authors?: string;
  ISBN?: string;
  publisher?: string;
  publishedDate?: string;
  genre?: string;
  id?: string;
  language?: string;
}
export interface Rating {
  values?: number[];
  average: number;
  title: string;
  id: string;
}
