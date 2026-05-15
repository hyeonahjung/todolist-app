'use strict';

process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

const env = require('./config/env');
const app = require('./app');

require('./config/db');

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

module.exports = app;
