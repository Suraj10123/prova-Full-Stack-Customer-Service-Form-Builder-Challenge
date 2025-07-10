// server/routes/forms.js
const express = require('express');
const {
  readForms,
  readForm,
  createForm,
  updateForm,
  deleteForm,
} = require('../services/formService');

const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await readForms()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:formId', async (req, res) => {
  try { res.json(await readForm(req.params.formId)); }
  catch (e) { res.status(404).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await createForm(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:formId', async (req, res) => {
  try { res.json(await updateForm(req.params.formId, req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:formId', async (req, res) => {
  try { await deleteForm(req.params.formId); res.status(204).end(); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
