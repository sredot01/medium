import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import LegalPage from './pages/LegalPage';
import SignIn from './pages/SignIn';
import Stories from './pages/Stories';
import EditPost from './pages/EditPost';
import Home from './pages/Home';
import ViewPost from './pages/ViewPost';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Followers from './pages/Followers';
import Following from './pages/Following';
import Bookmarks from './pages/Bookmarks';
import Stats from './pages/Stats';
import GitHubComplete from './pages/GitHubComplete';
import EmailAuthComplete from './pages/EmailAuthComplete';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/privacy" element={<LegalPage isPrivacy />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/auth/google/complete" element={<GitHubComplete google />} />
                <Route path="/auth/github/complete" element={<GitHubComplete />} />
                <Route path="/auth/email/signup" element={<EmailAuthComplete isSignup />} />
                <Route path="/auth/email/reset" element={<EmailAuthComplete />} />
                <Route path="/home" element={<Home />} />
                <Route path="/post/:slug" element={<ViewPost />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/edit/:id" element={<EditPost />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<EditProfile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/profile/:userId/followers" element={<Followers />} />
                <Route path="/profile/:userId/following" element={<Following />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
