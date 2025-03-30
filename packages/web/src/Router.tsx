import { createBrowserRouter } from "react-router-dom";
import { NavBar } from "./page/Home-page";
import LoginPage from "./page/Login-page";
import AffiliationDetail from "./components/affiliation-detail";
import Layout from "./page/Layout";
import { Dashboard } from "./components/dashboard";
import { ArticlePieChart } from "./components/charts/pie-chart";
import AffiliationsPage from "./page/Affiliations-page";
import AuthorsPage from "./page/Author-page";
import ArticlePage from "./page/Article-page";
import ArticleDetailPage from "./page/Article-detail-page";
import CrawlJobsPage from "./page/CrawlJobs-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Dashboard></Dashboard>
      </Layout>
    ),
  },
  {
    path: "/pie-chart",
    element: (
      <Layout>
        <ArticlePieChart />
      </Layout>
    ),
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
      <Layout>
        <AffiliationsPage></AffiliationsPage>,
      </Layout>
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
    path: "/authors",
    element: (
      <Layout>
        <AuthorsPage />
      </Layout>
    ),
  },
  {
    path: "/articles",
    element: (
      <Layout>
        <ArticlePage />
      </Layout>
    ),
  },
  {
    path: "/articles/:id",
    element: (
      <Layout>
        <ArticleDetailPage />
      </Layout>
    ),
  },
  {
    path: "/crawl-jobs",
    element: (
      <Layout>
        <CrawlJobsPage />
      </Layout>
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
