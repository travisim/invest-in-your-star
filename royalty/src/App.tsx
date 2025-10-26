import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger.tsx";
import CreatorDashboard from "./pages/creator/CreatorDashboard.tsx";
import CreateContent from "./pages/creator/CreateContent.tsx";
import ManageContent from "./pages/creator/ManageContent.tsx";
import CreatorAnalytics from "./pages/creator/CreatorAnalytics.tsx";
import InvestorDashboard from "./pages/investor/InvestorDashboard.tsx";
import DiscoverContent from "./pages/investor/DiscoverContent.tsx";
import Portfolio from "./pages/investor/Portfolio.tsx";
import Earnings from "./pages/investor/Earnings.tsx";
import BusinessDashboard from "./pages/business/BusinessDashboard.tsx";
import BrowseLicenses from "./pages/business/BrowseLicenses.tsx";
import ActiveLicenses from "./pages/business/ActiveLicenses.tsx";
import Compliance from "./pages/business/Compliance.tsx";
import Login from "./pages/auth/Login.tsx";
import KYCFlow from "./pages/auth/KYCFlow.tsx";
import Onboarding from "./pages/auth/Onboarding.tsx";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="My App"
      projectTitle="My App"
      contentRight={
        <>
          <nav>
            <NavLink to="/creator/dashboard">Creator</NavLink> |
            <NavLink to="/investor/dashboard">Investor</NavLink> |
            <NavLink to="/business/dashboard">Business</NavLink> |
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => (window.location.href = "/debug")}
                  disabled={isActive}
                >
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} My App. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />

        {/* Creator Routes */}
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/create" element={<CreateContent />} />
        <Route path="/creator/manage" element={<ManageContent />} />
        <Route path="/creator/analytics" element={<CreatorAnalytics />} />

        {/* Investor Routes */}
        <Route path="/investor/dashboard" element={<InvestorDashboard />} />
        <Route path="/investor/discover" element={<DiscoverContent />} />
        <Route path="/investor/portfolio" element={<Portfolio />} />
        <Route path="/investor/earnings" element={<Earnings />} />

        {/* Business Routes */}
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/business/browse" element={<BrowseLicenses />} />
        <Route path="/business/licenses" element={<ActiveLicenses />} />
        <Route path="/business/compliance" element={<Compliance />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/kyc" element={<KYCFlow />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>
    </Routes>
  );
}

export default App;
