var config = require("../../config");
var http = require('http');
var https = require('https');
const translate = require('google-translate-api');

var gmailSender = require('gmail-sender-oauth');

// node-oradb package...
var oracledb = require('oracledb');
var dbConfig = require('../../dbconfig.js');

var connectionPool = [];
var connections = 5;

exports.getDataGeneric = function (query, params, callback) {

	console.log("Inside getDataGeneric, before establishing connection. Query is [" + query + "]");

	getData(query, params, callback);
};

exports.insertDataGeneric = function (query, params, callback) {

	console.log("Concatenated query to execute is [" + query + "]");

	insertData(query, params, callback);
};

function getData(query, params, callback) {

	// Get a non-pooled connection
	oracledb.getConnection({
			user: dbConfig.user,
			password: dbConfig.password,
			connectString: dbConfig.connectString
		},
		function (err, connection) {
			if (err) {
				console.error(err.message);
				return;
			}


			connection.execute(
				// The statement to execute
				query,

				// The "bind value" 180 for the bind variable ":id"
				params,

				// execute() options argument.  Since the query only returns one
				// row, we can optimize memory usage by reducing the default
				// maxRows value.  For the complete list of other options see
				// the documentation.
				{
					//maxRows: 1
					//, outFormat: oracledb.OBJECT  // query result format
					//, extendedMetaData: true      // get extra metadata
					//, fetchArraySize: 100         // internal buffer allocation size for tuning
				},

				// The callback function handles the SQL execution results
				function (err, result) {
					if (err) {
						console.error(err.message);
						doRelease(connection);
						return;
					}
					console.log(result.metaData); // E.g. [ { name: 'ORDERID' }, { name: 'PRODUCT' } ]
					console.log(result.rows); // E.g. [ [ 180, 'Holy Socks' ] ]
					doRelease(connection);

					callback(result.metaData, result.rows);
				});
		});
}

function insertData(query, params, callback) {

	// Get a non-pooled connection
	oracledb.getConnection({
			user: dbConfig.user,
			password: dbConfig.password,
			connectString: dbConfig.connectString
		},

		function (err, connection) {

			if (err) {
				console.error(err.message);
				return;
			}

			// for (var x in orders) {

			connection.execute(
				query, params, // Bind values
				{
					autoCommit: true
				}, // Override the default non-autocommit behavior
				function (err, result) {
					if (err) {
						console.error("Error ocurred [" + err.message + "]");
						doRelease(connection);
						return;
					}
					console.log("Rows inserted: " + result.rowsAffected); // 1?
					doRelease(connection);
					callback();
				});
			// }
		});
}



// Note: connections should always be released when not needed
function doRelease(connection) {
	connection.close(
		function (err) {
			if (err) {
				console.error(err.message);
			}
		});
}

function sendRequest(host, port, path, method, body, secured, callback) {

	try {

		var post_req = null;

		var options = {
			host: host,
			port: port,
			path: path,
			method: method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			}
		};

		var transport = secured ? https : http;

		post_req = transport.request(options, function (res) {

			console.log("Sending [" + host + ":" + port + path + "] under method [" + method + "]");
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			var fullResponse = "";

			res.on('data', function (chunk) {
				fullResponse += chunk;
			});

			res.on('end', function () {

				console.log('Response: ', fullResponse);

				try {
					var result = JSON.parse(fullResponse);
				} catch (error) {

					console.log("An unexpected error just occured [" + error + "] - Please verify input and try again");
				}
				// Executing callback function:
				callback(result);
			});
		});

		post_req.on('error', function (e) {
			console.log('There was a problem with request: ' + e.message);
			return undefined;
		});

		post_req.write(body);
		post_req.end();

	} catch (error) {

		console.log("An unexpected error just occured [" + error + "] - Please verify input and try again");
	}

}

exports.getNewID = function () {

	var length = 6,
		charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		retVal = "";
	for (var i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return "ORD_" + retVal;
}