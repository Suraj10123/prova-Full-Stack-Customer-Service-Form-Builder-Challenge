const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const formRoutes = require('./routes/forms');
const submissionRoutes = require('./routes/submissions');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/forms', formRoutes);
app.use('/api/forms', submissionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});