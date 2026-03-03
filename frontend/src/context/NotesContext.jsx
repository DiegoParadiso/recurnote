import React, { createContext, useState, useContext } from 'react';

import { DateTime } from 'luxon';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState({});
  const now = DateTime.now();
  const [selectedDay, setSelectedDay] = useState({
    year: now.year,
    month: now.month,
    day: now.day
  });

  return (
    <NotesContext.Provider value={{ notes, setNotes, selectedDay, setSelectedDay }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);