const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const cors = require('cors');
const mongoose = require('mongoose');
const OrderStatus = require('./apps/models/order_statuses.model');

// routes
const routes = require('./apps/routes/index.route');


//Setup enviroment file
require('dotenv').config({ path: __dirname + '/.env' })
var port = process.env['PORT'];

// initialize our express app
const app = express();

// Set up mongoose connection
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.once('connected', function (err) {
    if (err) {
        console.error("✘ DB Connection Failed.", err);
    } else {
        console.error("✓ DB Connected.");
        OrderStatus.find({}, function (err, data) {
            if (!err && data && data.length === 0) {
                var orderStatusObj = [
                    { status_name: "Open" },
                    { status_name: "Return" },
                    { status_name: "Cancel" },
                    { status_name: "View" },
                    { status_name: "Scheduled" },
                    { status_name: "Delivered" },
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

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));
app.use(cors());

app.use('/api/v1', routes)

app.listen(port, () => {
    console.log('✓ Server is up and running on port number ' + port);
});