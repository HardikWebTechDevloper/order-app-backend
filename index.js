const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const expressConfig = require('./apps/config/expressConfig');
const OrderStatus = require('./apps/models/order_statuses.model');
const { rejectUnApprovedOrders, checkUnConfiguredOrders } = require('./apps/controllers/order.controller');

// routes
const routes = require('./apps/routes/index.route');

//Setup enviroment file
require('dotenv').config({ path: __dirname + '/.env' })
var port = process.env['PORT'];

// initialize our express app
const app = express();

// Set up mongoose connection
const MONGO_USER_NAME = process.env.MONGO_USER_NAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const DB_NAME = process.env.DB_NAME;

const mongoURL = `mongodb://${MONGO_USER_NAME}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOST}:${MONGO_PORT}`;
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: DB_NAME });
mongoose.Promise = global.Promise;
const db = mongoose.connection;


db.once('connected', async function (err) {
    if (err) {
        console.error("✘ DB Connection Failed.", err);
    } else {
        console.error("✓ DB Connected.");
        OrderStatus.find({}, function (err, data) {
            if (!err && data && data.length === 0) {
                var orderStatusObj = [
                    { status_name: "PENDING" },
                    { status_name: "ACCEPTED" },
                    { status_name: "REJECTED_BY" },
                    { status_name: "NOT_ACCEPTED_BY" },
                    { status_name: "SCHEDULED" },
                    { status_name: "DELIVERED" },
                    { status_name: "RETURN" },
                ];

                OrderStatus.insertMany(orderStatusObj, forceServerObjectId = true, function (err, data) {
                    if (err != null) {
                        console.err("✘ Error while create order status", err);
                    }
                });
            }
        });
    }
});

db.on('error', console.error.bind(console, '✘ MongoDB connection error:'));

expressConfig(app);

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());

app.use('/api/v1', routes);

cron.schedule('* * * * *', rejectUnApprovedOrders);
cron.schedule('0 */15 * * *', checkUnConfiguredOrders);

app.listen(port, () => {
    console.log('✓ Server is up and running on port number ' + port);
});