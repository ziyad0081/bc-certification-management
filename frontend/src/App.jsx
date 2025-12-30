import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Layout from './components/Layout';
import Home from './pages/Home';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import MyCredentials from './pages/MyCredentials';
import IssuerDashboard from './pages/IssuerDashboard';

function App() {
  return (
    <Web3Provider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issue" element={<IssueCredential />} />
            <Route path="/verify" element={<VerifyCredential />} />
            <Route path="/verify/:credentialId" element={<VerifyCredential />} />
            <Route path="/my-credentials" element={<MyCredentials />} />
            <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </Web3Provider>
  );
}

export default App;
