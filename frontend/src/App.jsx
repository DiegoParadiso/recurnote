import Home from './pages/Home';
import { ItemsProvider } from './context/ItemsContext';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  return (
    <div id="app-container">
      <ItemsProvider>
        <Home />
      </ItemsProvider>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
