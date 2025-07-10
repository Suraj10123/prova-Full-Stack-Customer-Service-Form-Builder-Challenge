import React, { useState } from 'react';

export default function DynamicForm({ schema, onSubmit }) {
  const [values, setValues] = useState({});
  const handleChange = e => setValues(v => ({ ...v, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(values); }}>
      <h2>{schema.title}</h2>
      {schema.fields.map(f => (
        <div key={f.id}>
          <label>{f.label}{f.required ? '*' : ''}</label>
          {f.type === 'select' ? (
            <select name={f.id} onChange={handleChange}>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input
              name={f.id}
              type={f.type}
              required={f.required}
              onChange={handleChange}
            />
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
