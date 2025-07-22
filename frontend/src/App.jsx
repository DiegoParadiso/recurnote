import Home from './pages/Home';
import { ItemsProvider } from './context/ItemsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { isLightTheme } = useTheme();

  return (
    <div id="app-container" className={isLightTheme ? '' : 'dark'}>
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
