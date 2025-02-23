import React, { useState, useEffect, JSX } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export interface Affiliation {
  _id: string;
  name: string;
  parent?: string; // Parent ID, optional for root level
  users?: string[]; // Optional user list
  createdAt?: string;
  updatedAt?: string;
}

const AffiliationTree: React.FC = () => {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAffiliation, setEditingAffiliation] =
    useState<Affiliation | null>(null);
  const [newAffiliation, setNewAffiliation] = useState<Affiliation>({
    _id: "",
    name: "",
  });
  const [creatingChild, setCreatingChild] = useState<string | null>(null); // Track which item is having a child created
  const [newChildAffiliation, setNewChildAffiliation] = useState<Affiliation>({
    _id: "",
    name: "",
  });
  const handleCreateChild = async (parentId: string) => {
    try {
      const childData = { ...newChildAffiliation, parent: parentId };
      const response = await axios.post<Affiliation>(API_ENDPOINT, childData, {
        withCredentials: true,
      });
      setAffiliations([...affiliations, response.data]);
      setNewChildAffiliation({ _id: "", name: "" }); // Clear input
      setCreatingChild(null); // Close the input field
    } catch (err: any) {
      setError(err.message);
    }
  };

  const API_ENDPOINT = "http://localhost:5000/api/affiliation";

  useEffect(() => {
    fetchAffiliations();
  }, []);

  const fetchAffiliations = async () => {
    try {
      const response = await axios.get<Affiliation[]>(API_ENDPOINT, {
        withCredentials: true,
      });
      setAffiliations(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (editingAffiliation) {
        await axios.patch(
          `${API_ENDPOINT}/${editingAffiliation._id}`,
          { name: editingAffiliation.name },
          { withCredentials: true }
        );
        const updatedAffiliations = affiliations.map((aff) =>
          aff._id === editingAffiliation._id ? editingAffiliation : aff
        );
        setAffiliations(updatedAffiliations);
        setEditingAffiliation(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_ENDPOINT}/${id}`, { withCredentials: true });
      setAffiliations(affiliations.filter((aff) => aff._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (affiliation: Affiliation) => {
    setEditingAffiliation({ ...affiliation });
  };

  const handleCancelEdit = () => {
    setEditingAffiliation(null);
  };

  const buildTree = (
    items: Affiliation[],
    parentId: string | undefined = undefined,
    level: number = 0
  ): JSX.Element[] => {
    const children = items.filter((item) => item.parent === parentId);
    return children.map((child) => (
      <li
        key={child._id}
        style={{ marginLeft: `${level * 20}px`, listStyleType: "none" }}
      >
        {" "}
        {/* Indentation */}
        {editingAffiliation && editingAffiliation._id === child._id ? (
          <input
            type="text"
            value={editingAffiliation.name}
            onChange={(e) =>
              setEditingAffiliation({
                ...editingAffiliation,
                name: e.target.value,
              })
            }
            style={{ marginRight: "10px" }}
          />
        ) : (
          <span style={{ marginRight: "10px" }}>{child.name}</span>
        )}
        <Link to={`/affiliations/${child._id}`}>
          <button style={{ marginRight: "5px" }}>Detail</button>
        </Link>
        {editingAffiliation && editingAffiliation._id === child._id ? (
          <>
            <button onClick={handleUpdate} style={{ marginRight: "5px" }}>
              Update
            </button>
            <button onClick={handleCancelEdit} style={{ marginRight: "5px" }}>
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => handleEdit(child)}
            style={{ marginRight: "5px" }}
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleDelete(child._id)}
          style={{ marginRight: "5px" }}
        >
          Delete
        </button>
        <button
          onClick={() => setCreatingChild(child._id)}
          style={{ marginRight: "5px" }}
        >
          Create Child
        </button>{" "}
        {/* New button */}
        {creatingChild === child._id && ( // Conditional input for child creation
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              value={newChildAffiliation.name}
              onChange={(e) =>
                setNewChildAffiliation({
                  ...newChildAffiliation,
                  name: e.target.value,
                })
              }
              placeholder="Child Name"
              style={{ marginRight: "10px" }}
            />
            <button
              onClick={() => handleCreateChild(child._id)}
              style={{ marginRight: "5px" }}
            >
              Create
            </button>
            <button onClick={() => setCreatingChild(null)}>Cancel</button>
          </div>
        )}
        <ul>
          {buildTree(items, child._id, level + 1)} {/* Recursive call */}
        </ul>
      </li>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const tree = buildTree(affiliations);

  return (
    <div>
      <h2>Danh sách đơn vị</h2>
      <ul>{tree}</ul>
    </div>
  );
};

export default AffiliationTree;
