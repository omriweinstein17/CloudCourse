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
}
const Library: Book[] = [];

module.exports = Library;
