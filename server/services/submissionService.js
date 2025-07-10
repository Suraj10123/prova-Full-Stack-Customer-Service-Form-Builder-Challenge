// server/services/submissionService.js
const db = require('./db');
const { v4: uuid } = require('uuid');

function readSubs(formId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM submissions WHERE formId = ?`,
      [formId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(
          rows.map(r => ({
            id: r.id,
            formId: r.formId,
            timestamp: r.timestamp,
            // Read from SQL’s `data` column
            values: JSON.parse(r.data),
          }))
        );
      }
    );
  });
}

function createSub(formId, values) {
  return new Promise((resolve, reject) => {
    const id = uuid();
    const ts = new Date().toISOString();
    db.run(
      // Insert into `data` instead of `values`
      `INSERT INTO submissions (id, formId, timestamp, data) VALUES (?, ?, ?, ?)`,
      [id, formId, ts, JSON.stringify(values)],
      err => {
        if (err) return reject(err);
        resolve({ id, formId, timestamp: ts, values });
      }
    );
  });
}

function updateSub(formId, subId, values) {
  return new Promise((resolve, reject) => {
    const ts = new Date().toISOString();
    db.run(
      // Update the `data` column
      `UPDATE submissions SET data = ?, timestamp = ? WHERE id = ? AND formId = ?`,
      [JSON.stringify(values), ts, subId, formId],
      err => {
        if (err) return reject(err);
        resolve({ id: subId, formId, timestamp: ts, values });
      }
    );
  });
}

module.exports = { readSubs, createSub, updateSub };
