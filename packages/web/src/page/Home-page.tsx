import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export const HomePage = () => {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();

  const navigate = useNavigate();

  //   useEffect(() => {
  //     if (!session) {
  //       navigate("/login");
  //     }
  //   }, [session, navigate]);

  if (isPending) {
    return <div className="container">Loading...</div>;
  }

  // check if the user is logged in
  if (!session) {
    return (
      <div className="container">
        <h1>Home</h1>
        <p>You are not logged in.</p>
        <button className="container" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  return <Home />;
};

function Home() {
  return (
    <div style={{ margin: "20px" }}>
      <NavBar></NavBar>
    </div>
  );
}

export function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/affiliations">Affiliations</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
