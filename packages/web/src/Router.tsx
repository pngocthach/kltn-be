import { createBrowserRouter } from "react-router-dom";
import { HomePage, NavBar } from "./page/Home-page";
import LoginPage from "./page/Login-page";
import AffiliationTree from "./components/affiliation";
import AffiliationDetail from "./components/affiliation-detail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: (
      <div style={{ margin: "20px" }}>
        <NavBar></NavBar>
        <LoginPage></LoginPage>
      </div>
    ),
  },
  {
    path: "/affiliations", // Path for the AffiliationTree component
    element: (
      <div style={{ margin: "20px" }}>
        <NavBar />
        <AffiliationTree />
      </div>
    ),
  },
  {
    path: "/affiliations/:id", // Dynamic route for affiliation details
    element: (
      <div style={{ margin: "20px" }}>
        <NavBar />
        <AffiliationDetail />
      </div>
    ),
  },
  {
    // Catch-all route for 404 page. MUST BE LAST
    path: "*",
    element: (
      <div style={{ margin: "20px" }}>
        <NavBar />
        <div>404 Not Found</div>
      </div>
    ),
  },
]);
