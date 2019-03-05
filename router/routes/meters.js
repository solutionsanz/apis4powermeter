var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var config = require("../../config");
var http = require('http');
var https = require('https');

var funct = require('./functions');

//CRI change:
var bodyParser = require('body-parser');

// Configure application routes
module.exports = function (app) {

    // CRI change to allow JSON parsing from requests:    
    app.use(bodyParser.json()); // Support for json encoded bodies 
    app.use(bodyParser.urlencoded({
        extended: true
    })); // Support for encoded bodies

    function log(apiMethod, apiUri, msg) {
        console.log("[" + apiMethod + "], [" + apiUri + "], [" + msg + "], [UTC:" +
            new Date().toISOString().replace(/\..+/, '') + "]");
    }

    /**
     * Adding APIs:
     * 
     */

    /* GET /devices */
    app.get('/devices', function (req, res) {


        var query = `SELECT * FROM METERS`;
        var params = [];

        log("GET", "/devices", "Query to execute [" + query + "]");


        funct.getDataGeneric(query, params, function (resMetadata, resData) {

            log("GET", "/devices", "Found: [" + JSON.stringify({
                resData
            }) + "]");

            // In order to comply with the API documentation, 
            // let's validate if an Array was return, in which
            // case we simply return it.
            // Otherwise we will create an array of 1 element
            // in the response.
            var arrResult = [];
            var renderedResult = {};
            if (resMetadata != null && resMetadata != undefined && resData != null && resData != undefined) {

                for (var x in resData) {

                    // Starting new order:
                    renderedResult = {};
                    for (var y in resData[x]) {


                        col = resMetadata[y].name.toLowerCase();
                        colValue = resData[x][y];
                        renderedResult[col] = colValue;

                        console.log("col is [" + col + "], colValue is [" + colValue + "]");
                    }
                    // Adding full record to array:
                    console.log("record is [" + JSON.stringify(renderedResult) + ']');
                    arrResult.push(renderedResult);
                }

            }

            // Returning result
            res.send({
                "devices": arrResult
            });
        });
    });


    /* GET /devices/:deviceId */
    app.get('/devices/:deviceId', function (req, res) {

        var deviceId = req.params.device_id; //deviceId to filter by (if given)

        var query = `SELECT * FROM METERS WHERE DEVICE_ID = :deviceId`;
        var params = [];

        if (deviceId != null && deviceId != undefined) {

            params = [deviceId];

        } else {
            res.status(400).end("deviceId parameter empty or invalid. Verify parameters and try again."); //Bad request...
            return;
        }

        log("GET", "/devices/deviceId", "deviceId received [" + deviceId + "]");


        funct.getDataGeneric(query, params, function (resMetadata, resData) {

            log("GET", "/devices/deviceId", "Found: [" + JSON.stringify({
                resData
            }) + "]");

            // In order to comply with the API documentation, 
            // let's validate if an Array was return, in which
            // case we simply return it.
            // Otherwise we will create an array of 1 element
            // in the response.
            // var result = [];
            var renderedResult = {};
            if (resMetadata != null && resMetadata != undefined && resData != null && resData != undefined) {

                for (var x in resData) {

                    // Starting new order:
                    renderedResult = {};
                    for (var y in resData[x]) {


                        col = resMetadata[y].name.toLowerCase();
                        colValue = resData[x][y];
                        renderedResult[col] = colValue;

                        console.log("col is [" + col + "], colValue is [" + colValue + "]");
                    }
                    // Adding full record to array:
                    console.log("record is [" + JSON.stringify(renderedResult) + ']');
                    // result.push(renderedResult);
                }

            }

            // Returning result
            res.send({
                "device": renderedResult
            });
        });
    });


    /* POST /devices/:deviceId */
    app.post('/devices/:deviceId', function (req, res) {

        var deviceId = req.params.device_id; //deviceId to filter by (if given)

        if (deviceId == null || deviceId == undefined) {
            log("POST", "/devices/:deviceId", "No deviceId received... Please verify and try again.");
            res.status(400).end("No deviceId received... Please verify and try again."); //Bad request...
            return;
        }

        // Retrieve Records to be inserted from Body:
        var device = req.body.device;


        if (device == null || device == undefined) {
            log("POST", "/devices/:deviceId", "No data received... Please verify and try again.");
            res.status(400).end("No data received... Please verify and try again."); //Bad request...
            return;
        }

        var strQuery = " INTO METERS (DEVICE_ID, DEVICE_EVENT, DEVICE_TEMP, DEVICE_BATTERY_PCT, DEVICE_USAGE, DEVICE_LAT, DEVICE_LONG, DEVICE_DATE_TIME, DEVICE_NAME, DEVICE_MODEL, DEVICE_MANAGER)";
        strQuery += " VALUES (:DEVICE_ID, :DEVICE_EVENT, :DEVICE_TEMP, :DEVICE_BATTERY_PCT, :DEVICE_USAGE, :DEVICE_LAT, :DEVICE_LONG, :DEVICE_DATE_TIME, :DEVICE_NAME, :DEVICE_MODEL, :DEVICE_MANAGER) ";

        var query = "INSERT ALL";
        var params = [];

        for (var x in device) {

            query = query + strQuery;

            query = query.replace(/:DEVICE_ID/g, deviceId);
            query = query.replace(/:DEVICE_EVENT/g, "'" + device[x].device_event + "'");
            query = query.replace(/:DEVICE_TEMP/g, device[x].device_temp);
            query = query.replace(/:DEVICE_BATTERY_PCT/g, device[x].device_battery_pct);
            query = query.replace(/:DEVICE_USAGE/g, device[x].device_usage);
            query = query.replace(/:DEVICE_LAT/g, device[x].device_lat);
            query = query.replace(/:DEVICE_LONG/g, device[x].device_long);
            query = query.replace(/:DEVICE_DATE_TIME/g, "'" + device[x].ddevice_date_time + "'");
            query = query.replace(/:DEVICE_NAME/g, "'" + device[x].device_name + "'");
            query = query.replace(/:DEVICE_MODEL/g, "'" + device[x].device_model + "'");
            query = query.replace(/:DEVICE_MANAGER/g, "'" + device[x].device_manager + "'");
        }

        query += "SELECT * FROM DUAL";


        console.log("Items/Rows to be inserted into DB [" + device.length + "]");

        funct.insertDataGeneric(query, params, function () {

            // Echoing result... node-oradb does not return the id, so let's temporarily return the incoming list of orders
            res.send({
                "device": device
            });
        });
    });


};