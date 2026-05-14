'use strict';

const app = require('./app');
const env = require('./config/env');

require('./config/db');

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
