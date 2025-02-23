import React, { useEffect, useState } from "react";

interface HierarchyItem {
  _id: string;
  name: string;
  parent?: string;
  users: string[];
  level: number;
}

interface AffiliationData {
  _id: string;
  name: string;
  parent: string;
  hierarchy: HierarchyItem[];
}

const Affiliation: React.FC = () => {
  const [data, setData] = useState<AffiliationData[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/affiliation", {
      method: "GET",
      credentials: "include", // Include cookies in the request
    })
      .then((response) => response.json())
      .then((data: AffiliationData[]) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (data.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded-lg shadow-lg">
      {data.map((affiliation) => (
        <div key={affiliation._id} className="mb-4">
          <h2 className="text-xl font-bold">{affiliation.name}</h2>
          <HierarchyList hierarchy={affiliation.hierarchy} />
        </div>
      ))}
    </div>
  );
};

interface HierarchyListProps {
  hierarchy: HierarchyItem[];
}

const HierarchyList: React.FC<HierarchyListProps> = ({ hierarchy }) => {
  return (
    <nav className="p-4 border rounded-lg shadow-md">
      <ol className="list-none flex flex-wrap">
        {hierarchy.map((item, index) => (
          <li key={item._id} className="flex items-center">
            <span className="text-lg font-bold">{item.name}</span>
            {index < hierarchy.length - 1 && (
              <span className="mx-2 text-gray-500">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Affiliation;
