// server/services/seed.js
const fs   = require('fs');
const path = require('path');
const db   = require('./db');

// Load your full JSON
const allForms = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/forms.json'), 'utf-8')
);

// Keep only the Customer Support entries
const csForms = allForms.filter(f => f.title === 'Customer Support');

db.serialize(() => {
  // Wipe existing so we never get dupes
  db.run(`DELETE FROM fields`);
  db.run(`DELETE FROM forms`);

  csForms.forEach((form, formIndex) => {
    // Insert the form record
    db.run(
      `INSERT INTO forms (id, title) VALUES (?, ?)`,
      [form.id, form.title]
    );

    // Insert its fields in order
    form.fields.forEach((fld, idx) => {
      db.run(
        `INSERT INTO fields 
           (id, formId, label, type, options, required, ord) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          fld.id,
          form.id,
          fld.label,
          fld.type,
          fld.options.length ? JSON.stringify(fld.options) : null,
          fld.required ? 1 : 0,
          idx,
        ]
      );
    });
  });
});
