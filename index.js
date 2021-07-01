require('dotenv').config();

// Initialize DB Connection
require('./config/database');

const config = require('./config/config').getConfig(), PORT = config.PORT;

const { server } = require('./config/server');

server.listen(PORT).on('error', (err) => {
    console.log('✘ Application failed to start');
    console.error('✘', err.message);
    process.exit(0);
}).on('listening', () => {
    console.log('✔ Application Running On ' + PORT);
});


module.exports = { server };