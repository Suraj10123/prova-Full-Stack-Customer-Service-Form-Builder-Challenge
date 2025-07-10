import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';

export default function FormBuilder() {
  // List of existing schemas
  const [schemas, setSchemas] = useState([]);
  // Currently editing schema ID (null = new)
  const [editingId, setEditingId] = useState(null);
  // Title & fields for the builder form
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState([]);

  // Fetch all schemas on mount
  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = () => {
    axios
      .get('http://localhost:4000/api/forms')
      .then(r => setSchemas(r.data))
      .catch(err => alert('Load failed: ' + err.message));
  };

  // Drag–drop reorder
  const onDragEnd = result => {
    if (!result.destination) return;
    const arr = Array.from(fields);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    setFields(arr);
  };

  // Add a new empty field
  const addField = () =>
    setFields([
      ...fields,
      { id: uuid(), label: '', type: 'text', options: [], required: false },
    ]);

  // Update a field property
  const updateField = (id, key, value) => {
    setFields(fields.map(f => (f.id === id ? { ...f, [key]: value } : f)));
  };

  // Populate builder with an existing schema for editing
  const startEdit = schema => {
    setEditingId(schema.id);
    setTitle(schema.title);
    setFields(schema.fields);
  };

  // Delete a schema
  const deleteSchema = id => {
    if (!window.confirm('Delete this form?')) return;
    axios
      .delete(`http://localhost:4000/api/forms/${id}`)
      .then(loadSchemas)
      .catch(err => alert('Delete failed: ' + err.message));
  };

  // Save (POST new or PUT update)
  const saveSchema = () => {
    if (!title.trim()) {
      alert('Form title is required');
      return;
    }
    const payload = { title, fields };
    const req = editingId
      ? axios.put(`http://localhost:4000/api/forms/${editingId}`, payload)
      : axios.post('http://localhost:4000/api/forms', payload);

    req
      .then(() => {
        alert(editingId ? 'Form updated!' : 'Form created!');
        // reset builder
        setEditingId(null);
        setTitle('');
        setFields([]);
        loadSchemas();
      })
      .catch(err => alert('Save failed: ' + err.message));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Form Builder</h1>

      {/* 1) List of existing schemas with Edit/Delete */}
      <ul>
        {schemas.map(s => (
          <li key={s.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{s.title}</strong>{' '}
            <button onClick={() => startEdit(s)}>Edit</button>{' '}
            <button onClick={() => deleteSchema(s.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <hr />

      {/* 2) Builder canvas */}
      <div style={{ margin: '1rem 0' }}>
        <label>
          Form Title:{' '}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter form title"
            style={{ width: '300px' }}
          />
        </label>
      </div>
      <button onClick={addField}>Add Field</button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((f, i) => (
                <Draggable key={f.id} draggableId={f.id} index={i}>
                  {prov => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      style={{
                        padding: '0.5rem',
                        margin: '0.5rem 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        ...prov.draggableProps.style,
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          style={{ flex: 2 }}
                          placeholder="Label"
                          value={f.label}
                          onChange={e =>
                            updateField(f.id, 'label', e.target.value)
                          }
                        />
                        <select
                          style={{ flex: 1 }}
                          value={f.type}
                          onChange={e =>
                            updateField(f.id, 'type', e.target.value)
                          }
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={f.required}
                            onChange={e =>
                              updateField(f.id, 'required', e.target.checked)
                            }
                          />{' '}
                          Required
                        </label>
                      </div>
                      {f.type === 'select' && (
                        <input
                          style={{ width: '100%', marginTop: '0.5rem' }}
                          placeholder="Options, comma-separated"
                          value={f.options.join(',')}
                          onChange={e =>
                            updateField(
                              f.id,
                              'options',
                              e.target.value
                                .split(',')
                                .map(o => o.trim())
                                .filter(o => o)
                            )
                          }
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button style={{ marginTop: '1rem' }} onClick={saveSchema}>
        {editingId ? 'Update Form' : 'Save New Form'}
      </button>
    </div>
  );
}
