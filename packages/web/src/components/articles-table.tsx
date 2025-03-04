import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const articles = [
  {
    id: 1,
    title: "Machine Learning Applications in Healthcare",
    authors: "John Doe, Jane Smith",
    affiliation: "Stanford University",
    date: "2024-02-20",
    citations: 45,
  },
  {
    id: 2,
    title: "Advances in Quantum Computing",
    authors: "Alice Johnson, Bob Wilson",
    affiliation: "MIT",
    date: "2024-02-18",
    citations: 32,
  },
  {
    id: 3,
    title: "Climate Change Impact Analysis",
    authors: "Sarah Brown, Mike Davis",
    affiliation: "Harvard University",
    date: "2024-02-15",
    citations: 28,
  },
  {
    id: 4,
    title: "Neural Networks in Computer Vision",
    authors: "David Lee, Emma White",
    affiliation: "UC Berkeley",
    date: "2024-02-12",
    citations: 56,
  },
  {
    id: 5,
    title: "Sustainable Energy Solutions",
    authors: "Chris Martin, Lisa Chen",
    affiliation: "Stanford University",
    date: "2024-02-10",
    citations: 41,
  },
];

export function ArticlesTable() {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Authors</TableHead>
            <TableHead>Affiliation</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Citations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>{article.authors}</TableCell>
              <TableCell>{article.affiliation}</TableCell>
              <TableCell>{article.date}</TableCell>
              <TableCell className="text-right">{article.citations}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
