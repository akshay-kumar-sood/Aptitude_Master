
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import QuestionList from './components/QuestionList';
import QuestionView from './components/QuestionView';
import Profile from './components/Profile';
import Store from './components/Store';
import Footer from './components/Footer';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/problems" element={<QuestionList />} />
                <Route path="/store" element={<Store />} />
                <Route path="/question/:id" element={<QuestionView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  );
};

export default App;
