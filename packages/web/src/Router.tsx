import { createBrowserRouter, Navigate } from "react-router-dom";
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
import SimilarArticlesPage from "./page/Similar-articles-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Dashboard />
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
    path: "/similar-articles",
    element: (
      <Layout>
        <SimilarArticlesPage />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/affiliations",
    element: (
      <Layout>
        <AffiliationsPage />
      </Layout>
    ),
  },
  {
    path: "/affiliations/:id",
    element: (
      <Layout>
        <AffiliationDetail />
      </Layout>
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
