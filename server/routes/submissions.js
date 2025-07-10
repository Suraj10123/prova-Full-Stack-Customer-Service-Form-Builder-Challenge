// server/routes/submissions.js
const express = require('express');
const {
  readSubs,
  createSub,
  updateSub,
} = require('../services/submissionService');

const router = express.Router();

router.post('/:formId/submissions', async (req, res) => {
  try {
    const sub = await createSub(req.params.formId, req.body.values);
    res.status(201).json(sub);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:formId/submissions', async (req, res) => {
  try {
    res.json(await readSubs(req.params.formId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:formId/submissions/:subId', async (req, res) => {
  try {
    const updated = await updateSub(
      req.params.formId,
      req.params.subId,
      req.body.values
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
