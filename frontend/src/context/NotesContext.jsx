import React, { createContext, useState, useContext } from 'react';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <NotesContext.Provider value={{ notes, setNotes, selectedDay, setSelectedDay }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);