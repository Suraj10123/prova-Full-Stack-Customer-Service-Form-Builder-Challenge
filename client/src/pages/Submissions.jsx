// client/src/pages/Submissions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function Submissions() {
  const { id: formId } = useParams();
  const [schema, setSchema]       = useState(null);
  const [subs, setSubs]           = useState([]);
  const [editId, setEditId]       = useState(null);
  const [editedValues, setEditedValues] = useState({});

  // Load schema + submissions
  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/forms/${formId}`)
      .then(r => setSchema(r.data))
      .catch(() => alert('Failed to load form schema'));

    loadSubs();
  }, [formId]);

  const loadSubs = () => {
    axios
      .get(`http://localhost:4000/api/forms/${formId}/submissions`)
      .then(r => setSubs(r.data))
      .catch(() => alert('Failed to load submissions'));
  };

  const startEdit = sub => {
    setEditId(sub.id);
    setEditedValues(sub.values);
  };

  const changeValue = (fieldId, value) => {
    setEditedValues({ ...editedValues, [fieldId]: value });
  };

  const saveEdit = () => {
    axios
      .put(
        `http://localhost:4000/api/forms/${formId}/submissions/${editId}`,
        { values: editedValues }
      )
      .then(() => {
        setEditId(null);
        loadSubs();
      })
      .catch(() => alert('Update failed'));
  };

  if (!schema) return <div>Loading…</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>
        <Link to="/">Forms</Link> |{' '}
        <Link to={`/forms/${formId}/submissions`}>Submissions</Link>
      </h1>

      {/* 1) Friendly intro */}
      <p style={{ fontStyle: 'italic', marginTop: 0 }}>
        🐾 Welcome to the “<strong>{schema.title}</strong>” submissions page!  
        Feel free to review or edit feedback below.
      </p>

      <h2>Submissions for “{schema.title}”</h2>

      {/* 2) No-submissions placeholder */}
      {subs.length === 0 ? (
        <p>No submissions yet. Be the first to leave a paw-tastic review!</p>
      ) : (
        subs.map(sub => (
          <div
            key={sub.id}
            style={{
              border: '1px solid #ddd',
              padding: '1rem',
              margin: '1rem 0'
            }}
          >
            <strong>Time:</strong>{' '}
            {new Date(sub.timestamp).toLocaleString()}
            <br />

            {editId === sub.id ? (
              // --- Edit mode ---
              <div style={{ marginTop: '0.5rem' }}>
                {schema.fields.map(f => (
                  <div key={f.id} style={{ margin: '0.5rem 0' }}>
                    <label style={{ display: 'block' }}>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        style={{ width: '100%', height: '4em' }}
                        value={editedValues[f.id] || ''}
                        onChange={e => changeValue(f.id, e.target.value)}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        value={editedValues[f.id] || ''}
                        onChange={e => changeValue(f.id, e.target.value)}
                      >
                        {f.options.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        value={editedValues[f.id] || ''}
                        onChange={e => changeValue(f.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                <button onClick={saveEdit}>Save</button>{' '}
                <button onClick={() => setEditId(null)}>Cancel</button>
              </div>
            ) : (
              // --- Read-only mode ---
              <>
                <strong>Data:</strong>
                <pre
                  style={{
                    background: '#f9f9f9',
                    padding: '0.5rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {JSON.stringify(sub.values, null, 2)}
                </pre>
                <button onClick={() => startEdit(sub)}>Edit</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
