import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export interface Affiliation {
  _id: string;
  name: string;
  parent?: string; // Parent ID, optional for root level
  users?: string[]; // Optional user list
  createdAt?: string;
  updatedAt?: string;
  authors: Author[];
}

interface Author {
  _id: string;
  name: string;
  url: string;
}

function AffiliationDetail() {
  const { id } = useParams(); // Get the dynamic "id" from the URL
  const [affiliation, setAffiliation] = useState<Affiliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");

  const API_ENDPOINT = "http://localhost:5000/api";

  useEffect(() => {
    const fetchAffiliation = async () => {
      try {
        const response = await axios.get<Affiliation>(
          `${API_ENDPOINT}/affiliation/${id}`,
          {
            withCredentials: true,
          }
        );

        console.log(">>> response", response.data);

        setAffiliation(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAffiliation();
  }, [id]);

  const handleAddAuthor = async () => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/authors`,
        { name: authorName, url: authorUrl },
        { withCredentials: true }
      );
      const newAuthor = response.data;
      console.log(">>> newAuthor", newAuthor);

      let updatedAuthors = affiliation?.authors.map((author) => author._id);

      console.log(">>> affiliation", affiliation);

      if (!updatedAuthors) updatedAuthors = [];
      updatedAuthors.push(newAuthor._id);

      console.log(">>> updatedAuthors", updatedAuthors);

      await axios.patch(
        `${API_ENDPOINT}/affiliation/${id}`,
        { authors: updatedAuthors },
        { withCredentials: true }
      );

      // Update the local state to trigger a re-render
      setAffiliation((prevAffiliation) => {
        if (!prevAffiliation) return null;
        return {
          ...prevAffiliation,
          authors: [...prevAffiliation.authors, newAuthor],
        };
      });

      // Handle success, e.g., update the UI or show a success message
      console.log("Author added successfully:", response.data);
    } catch (err: any) {
      // Handle error, e.g., show an error message
      console.error("Error adding author:", err.message);
    }
  };

  return (
    <>
      {" "}
      <div>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {affiliation && (
          <div>
            <h3>{affiliation.name}</h3>
          </div>
        )}
      </div>
      {affiliation?.authors.map((author, index) => (
        <div key={author._id}>
          <p>
            {index + 1}. {author.name}:{" "}
            <a href={author.url} target="_blank" rel="noopener noreferrer">
              {author.url}
            </a>
          </p>
        </div>
      ))}
      <h3>Add Author</h3>
      <label>Author Name:</label>
      <input
        type="text"
        placeholder="Enter new author name"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter new author url"
        value={authorUrl}
        onChange={(e) => setAuthorUrl(e.target.value)}
      />
      <button onClick={handleAddAuthor}>Add Author</button>
    </>
  );
}

export default AffiliationDetail;
