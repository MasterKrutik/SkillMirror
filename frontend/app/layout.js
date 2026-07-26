import './globals.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';

export const metadata = { 
  title: 'SkillMirror Platform | Multi-Signal AI Career Intelligence',
  description: 'Multi-agent interview scoring, Elo adaptive difficulty, fatigue tracking, skill graphs, and counterfactual what-if analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Layout>{children}</Layout>
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
