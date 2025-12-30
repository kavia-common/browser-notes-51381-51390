import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * @typedef {Object} Note
 * @property {string} id Stable unique id for React list rendering and updates.
 * @property {string} title Short title shown in list.
 * @property {string} body The note content.
 * @property {number} createdAt Unix ms timestamp.
 * @property {number} updatedAt Unix ms timestamp.
 */

/**
 * Create a simple unique id suitable for in-memory usage.
 * (No backend; avoids adding extra dependencies.)
 */
function createId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Theme is kept from the template for future styling work. */
  const [theme, setTheme] = useState('light');

  /** @type {[Note[], Function]} */
  const [notes, setNotes] = useState(() => {
    const now = Date.now();
    return [
      {
        id: createId(),
        title: 'Welcome',
        body: 'Create a note, edit it, or delete it — all in your browser (in memory).',
        createdAt: now,
        updatedAt: now,
      },
    ];
  });

  const [selectedNoteId, setSelectedNoteId] = useState(() => (notes[0]?.id ? notes[0].id : null));

  /** Editor state (separate from notes list so cancel/edit is easy). */
  const [editorMode, setEditorMode] = useState(/** @type {'create'|'edit'} */ ('edit'));
  const [titleDraft, setTitleDraft] = useState('');
  const [bodyDraft, setBodyDraft] = useState('');

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  const resetEditorToSelected = () => {
    if (!selectedNote) {
      setEditorMode('create');
      setTitleDraft('');
      setBodyDraft('');
      return;
    }
    setEditorMode('edit');
    setTitleDraft(selectedNote.title);
    setBodyDraft(selectedNote.body);
  };

  const startCreate = () => {
    setEditorMode('create');
    setSelectedNoteId(null);
    setTitleDraft('');
    setBodyDraft('');
  };

  const startEditSelected = () => {
    if (!selectedNote) return;
    setEditorMode('edit');
    setTitleDraft(selectedNote.title);
    setBodyDraft(selectedNote.body);
  };

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
    // Move editor to the selected note (common notes-app behavior)
    const nextSelected = notes.find((n) => n.id === id) || null;
    if (nextSelected) {
      setEditorMode('edit');
      setTitleDraft(nextSelected.title);
      setBodyDraft(nextSelected.body);
    }
  };

  const validateDraft = () => {
    const title = titleDraft.trim();
    const body = bodyDraft.trim();

    if (!title && !body) {
      return { ok: false, message: 'Please enter a title or some content.' };
    }
    return { ok: true, title, body };
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validation = validateDraft();
    if (!validation.ok) {
      // Minimal UX; ready for later styling/toasts.
      window.alert(validation.message);
      return;
    }

    const now = Date.now();
    const safeTitle = validation.title || 'Untitled';
    const safeBody = validation.body;

    if (editorMode === 'create') {
      const newNote = {
        id: createId(),
        title: safeTitle,
        body: safeBody,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      setEditorMode('edit');
      setTitleDraft(newNote.title);
      setBodyDraft(newNote.body);
      return;
    }

    // edit mode
    if (!selectedNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? {
              ...n,
              title: safeTitle,
              body: safeBody,
              updatedAt: now,
            }
          : n
      )
    );
  };

  const handleDelete = (idToDelete) => {
    const note = notes.find((n) => n.id === idToDelete);
    const label = note?.title ? `"${note.title}"` : 'this note';
    const ok = window.confirm(`Delete ${label}?`);
    if (!ok) return;

    setNotes((prev) => prev.filter((n) => n.id !== idToDelete));

    // If deleting selected, pick a new selection
    if (selectedNoteId === idToDelete) {
      const remaining = notes.filter((n) => n.id !== idToDelete);
      const next = remaining[0] || null;
      setSelectedNoteId(next?.id || null);
      if (next) {
        setEditorMode('edit');
        setTitleDraft(next.title);
        setBodyDraft(next.body);
      } else {
        startCreate();
      }
    }
  };

  return (
    <div className="App">
      <header className="notes-header">
        <div className="notes-header__left">
          <h1 className="notes-title">Notes</h1>
          <p className="notes-subtitle">In-browser notes (in memory)</p>
        </div>

        <div className="notes-header__right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            type="button"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="notes-main" aria-label="Notes application">
        <aside className="notes-sidebar" aria-label="Notes list">
          <div className="notes-sidebar__actions">
            <button type="button" className="btn" onClick={startCreate} aria-label="Create new note">
              + New note
            </button>
          </div>

          <ul className="notes-list" role="list" aria-label="All notes">
            {notes.length === 0 ? (
              <li className="notes-list__empty">No notes yet.</li>
            ) : (
              notes.map((n) => {
                const isSelected = n.id === selectedNoteId;
                return (
                  <li key={n.id} className={`notes-list__item ${isSelected ? 'is-selected' : ''}`}>
                    <button
                      type="button"
                      className="notes-list__select"
                      onClick={() => handleSelectNote(n.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      aria-label={`Select note: ${n.title}`}
                    >
                      <div className="notes-list__title">{n.title}</div>
                      <div className="notes-list__meta">
                        Updated {new Date(n.updatedAt).toLocaleString()}
                      </div>
                    </button>

                    <button
                      type="button"
                      className="notes-list__delete"
                      onClick={() => handleDelete(n.id)}
                      aria-label={`Delete note: ${n.title}`}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <section className="notes-editor" aria-label="Note editor">
          <div className="notes-editor__header">
            <h2 className="notes-editor__title">
              {editorMode === 'create' ? 'New note' : 'Edit note'}
            </h2>

            <div className="notes-editor__headerActions">
              {editorMode === 'edit' && selectedNote ? (
                <button type="button" className="btn" onClick={startCreate}>
                  New
                </button>
              ) : null}

              {editorMode === 'edit' && selectedNote ? (
                <button type="button" className="btn" onClick={resetEditorToSelected}>
                  Reset
                </button>
              ) : null}

              {editorMode === 'edit' && selectedNote ? (
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(selectedNote.id)}>
                  Delete
                </button>
              ) : null}

              {editorMode === 'edit' && selectedNote ? (
                <button type="button" className="btn" onClick={startEditSelected} aria-label="Edit selected note">
                  Edit
                </button>
              ) : null}
            </div>
          </div>

          <form className="notes-editor__form" onSubmit={handleSave}>
            <label className="field">
              <span className="field__label">Title</span>
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Untitled"
                className="field__input"
                aria-label="Note title"
              />
            </label>

            <label className="field">
              <span className="field__label">Content</span>
              <textarea
                value={bodyDraft}
                onChange={(e) => setBodyDraft(e.target.value)}
                placeholder="Write your note..."
                className="field__textarea"
                rows={10}
                aria-label="Note content"
              />
            </label>

            <div className="notes-editor__footer">
              <button type="submit" className="btn btn-primary" aria-label="Save note">
                Save
              </button>

              <div className="notes-editor__hint" aria-live="polite">
                {editorMode === 'edit' && selectedNote ? (
                  <span>
                    Last updated: <strong>{new Date(selectedNote.updatedAt).toLocaleString()}</strong>
                  </span>
                ) : (
                  <span>Create a note and click “Save”.</span>
                )}
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
