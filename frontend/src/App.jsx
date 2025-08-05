import Home from './pages/Home';
import { ItemsProvider } from './context/ItemsContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotesProvider } from './context/NotesContext'; // Importá el contexto de notas

function AppContent() {
  return (
    <div id="app-container">
      <ItemsProvider>
        <NotesProvider>
          <Home />
        </NotesProvider>
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
