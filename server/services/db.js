// server/services/db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuid } = require('uuid');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Run migrations & seed default templates if none exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS fields (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL,
      options TEXT,
      required INTEGER NOT NULL,
      ord INTEGER NOT NULL,
      FOREIGN KEY(formId) REFERENCES forms(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT NOT NULL,
      FOREIGN KEY(formId) REFERENCES forms(id)
    )
  `);

  // Seed if empty
  db.get(`SELECT COUNT(*) AS cnt FROM forms`, (err, row) => {
    if (err) throw err;
    if (row.cnt === 0) {
      // Customer Support template
      const csId = uuid();
      db.run(`INSERT INTO forms(id,title) VALUES(?,?)`, [csId, 'Customer Support']);
      const csFields = [
        { label: 'Email Address', type: 'email', options: [], required: 1 },
        { label: 'Order Number',  type: 'text',  options: [], required: 1 },
        { 
          label: 'Issue Type',    type: 'select',
          options: ['Damaged','Late Delivery','Wrong Item','Other'],
          required: 1
        },
        { label: 'Description',   type: 'textarea', options: [], required: 1 }
      ];
      csFields.forEach((f, i) => {
        db.run(
          `INSERT INTO fields (id,formId,label,type,options,required,ord)
           VALUES (?,?,?,?,?,?,?)`,
          [uuid(), csId, f.label, f.type, JSON.stringify(f.options), f.required, i]
        );
      });

      // Al Pawcino Special template
      const apId = uuid();
      db.run(`INSERT INTO forms(id,title) VALUES(?,?)`, [apId, 'Al Pawcino Special']);
      const apFields = [
        { label: 'Your Review', type: 'textarea', options: [], required: 1 }
      ];
      apFields.forEach((f, i) => {
        db.run(
          `INSERT INTO fields (id,formId,label,type,options,required,ord)
           VALUES (?,?,?,?,?,?,?)`,
          [uuid(), apId, f.label, f.type, JSON.stringify(f.options), f.required, i]
        );
      });

      console.log('✅ Seeded default templates: Customer Support & Al Pawcino Special');
    }
  });
});

module.exports = db;
