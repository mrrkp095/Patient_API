
import  express  from "express";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

import {notFoundResponse,unauthorizedResponse}  from "./helpers/apiResponse.js";


import cookieParser from"cookie-parser";
import logger from "morgan";
require("dotenv").config();
import indexRouter from "./routes/index.js";
import apiRouter from"./routes/api.js";

import cors from"cors";

// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
console.log("Ramesh");
console.log(MONGODB_URL);
var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
	if(process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
// var db = mongoose.connection;

var app = express();

//don't show the log when it is test
if(process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static("public"));
//To allow cross-origin requests
app.use(cors());
app.use(cors({origin: true, credentials: true}));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function(req, res) {
	return notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return unauthorizedResponse(res, err.message);
	}
});

export default app;


// login routes
// call auth here
// secures routes