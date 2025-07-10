// server/services/formService.js
const db = require('./db');
const { v4: uuid } = require('uuid');

function readForms() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM forms`, [], (err, forms) => {
      if (err) return reject(err);
      // fetch fields for each form
      const promises = forms.map(form => new Promise((res, rej) => {
        db.all(
          `SELECT * FROM fields WHERE formId = ? ORDER BY ord`,
          [form.id],
          (e, fields) => {
            if (e) return rej(e);
            const formatted = fields.map(f => ({
              id: f.id,
              label: f.label,
              type: f.type,
              options: f.options ? JSON.parse(f.options) : [],
              required: !!f.required,
            }));
            res({ id: form.id, title: form.title, fields: formatted });
          }
        );
      }));
      Promise.all(promises).then(resolve).catch(reject);
    });
  });
}

function readForm(id) {
  return readForms().then(forms => {
    const form = forms.find(f => f.id === id);
    if (!form) throw new Error('Form not found');
    return form;
  });
}

function createForm({ title, fields }) {
  return new Promise((resolve, reject) => {
    const id = uuid();
    db.run(`INSERT INTO forms (id, title) VALUES (?, ?)`, [id, title], err => {
      if (err) return reject(err);
      // insert each field
      const stmt = db.prepare(`
        INSERT INTO fields (id, formId, label, type, options, required, ord)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      fields.forEach((f, idx) => {
        stmt.run(
          f.id || uuid(),
          id,
          f.label,
          f.type,
          JSON.stringify(f.options || []),
          f.required ? 1 : 0,
          idx
        );
      });
      stmt.finalize(err2 => {
        if (err2) return reject(err2);
        resolve({ id, title, fields });
      });
    });
  });
}

function updateForm(id, { title, fields }) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE forms SET title = ? WHERE id = ?`, [title, id], err => {
      if (err) return reject(err);
      // delete old fields
      db.run(`DELETE FROM fields WHERE formId = ?`, [id], err2 => {
        if (err2) return reject(err2);
        // re-insert fields
        const stmt = db.prepare(`
          INSERT INTO fields (id, formId, label, type, options, required, ord)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        fields.forEach((f, idx) => {
          stmt.run(
            f.id || uuid(),
            id,
            f.label,
            f.type,
            JSON.stringify(f.options || []),
            f.required ? 1 : 0,
            idx
          );
        });
        stmt.finalize(err3 => {
          if (err3) return reject(err3);
          resolve({ id, title, fields });
        });
      });
    });
  });
}

function deleteForm(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM forms WHERE id = ?`, [id], err => {
      if (err) return reject(err);
      db.run(`DELETE FROM fields WHERE formId = ?`, [id], err2 => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
}

module.exports = { readForms, readForm, createForm, updateForm, deleteForm };
