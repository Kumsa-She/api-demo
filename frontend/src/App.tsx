import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import Challenges from './pages/Challenges';
import Docs from './pages/Docs';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route element={<Home />} path="/" />
            <Route element={<Explorer />} path="/explorer" />
            <Route element={<Challenges />} path="/challenges" />
            <Route element={<Docs />} path="/docs" />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
