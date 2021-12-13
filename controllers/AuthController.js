import AccountModel  from "../models/AccountModel.js";
import { body, validationResult } from "express-validator";
import { sanitizeBody } from"express-validator";
import {successResponseWithData,ErrorResponse,validationErrorWithData,unauthorizedResponse}  from "../helpers/apiResponse.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
import jwt from "jsonwebtoken";
import UserProfile from "../models/UserProfileModel.js";


/**
 * * Account registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      age
 * @param {string}      genderCd
 * @param {string}      mobileNumber
 * @param {string}      otp
 * @param {string}      checkbox
 * 
 *  @returns {Object}
 */
const register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("age").isLength({ min: 1 }).trim().withMessage("Age must be specified.")
		.isNumeric().withMessage("Age should be numeric."),
	body("genderCd").isLength({ min: 1 }).trim().withMessage("Gender must be specified."),
	body("mobileNumber").isLength({ min: 10 }).trim().withMessage("Mobile Number must be specified 10 digits.")
		.isNumeric().withMessage("Invalid Mobile Number.")
		.custom((value) => {
			return AccountModel.findOne({ mobileNumber: value}).then(accountModel => {
				if (accountModel) {
					return Promise.reject("This Number has already exits please try to different number");
				}
			});
		}),
		body("otp").isLength({ min: 4 }).trim().withMessage("otp must be specified.")
		.isNumeric().withMessage("otp should be numeric."),
	body("checkbox").isLength({ min: 1 }).trim().withMessage("checkbox must be specified."),
	

	// Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("age").escape(),
	sanitizeBody("genderCd").escape(),
	sanitizeBody("mobileNumber").escape(),
	sanitizeBody("otp").escape(),
	sanitizeBody("checkbox").escape(),




	// Process request after validation and sanitization.
	 (req,res) => {
		try {
		

			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var account = new AccountModel(
					{
						mobileNumber: req.body.mobileNumber,
						age: req.body.age,
						otp: req.body.otp,
						checkbox: req.body.checkbox,

					}
				);

				
				account.save(function (err) {
					if (err) {
						return ErrorResponse(res, err);
					}
					let accountData = {
						_id: account._id,
						mobileNumber: account.mobileNumber,
						age: req.body.age
					};

					var userProfile = new UserProfile(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							age: req.body.age,
							genderCd: req.body.genderCd,
							relationshipCd: "Self",
							profilePhoto: "",
							patientUID: "PT" + parseInt(Math.random() * (9999999999 - 1000000000) + 1000000000),
							mobileNumber: req.body.mobileNumber,
							_accountId: account._id,
						});
console.log(userProfile)
					userProfile.save(function (err) {
						if (err) {
							return ErrorResponse(res, err);
						}
						let userProfileData = {
							_id: userProfile._id,
							firstName: userProfile.firstName,
							lastName: userProfile.lastName,
							mobileNumber: userProfile.mobileNumber,
							_accountId: userProfile._accountId,
						};

						return successResponseWithData(res, "Registration Success.",userProfileData,accountData);
					});


				});


			}
		} catch (err) {
			console.log(err.message);
			//throw error in json response with status 500.
			return ErrorResponse(res, err);
		}
	}];

/**
 * Account login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
const login = [
	body("mobileNumber").isLength({ min: 1 }).trim().withMessage("Mobile Number must be specified.")
		.isNumeric().withMessage("Invalid Mobile Number."),
	body("age").isLength({ min: 1 }).trim().withMessage("Age must be specified.")
		.isNumeric().withMessage("Age should be numeric."),

	sanitizeBody("mobileNumber").escape(),
	sanitizeBody("age").escape(),

	(req,res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				AccountModel.findOne({ mobileNumber: req.body.mobileNumber }).then(account => {
					if (account) {
						if (1 == 1) {
							let accountData = {
								_id: account._id,
								firstName: account.firstName,
								lastName: account.lastName,
								email: account.email,
							};
							//Prepare JWT token for authentication
							const jwtPayload = accountData;
							const jwtData = {
								expiresIn: process.env.JWT_TIMEOUT_DURATION,
							};
							const secret = process.env.JWT_SECRET;
							//Generated JWT token with Payload and secret.
							accountData.token = jwt.sign(jwtPayload, secret, jwtData);
							return successResponseWithData(res, "Login Success.", accountData);
						} else {
							return unauthorizedResponse(res, "Mobile Number or Age wrong.");
						}
						//});
					} else {
						return unauthorizedResponse(res, "Mobile Number or Age wrong.");
					}
				});
			}
		} catch (err) {
			return ErrorResponse(res, err);
		}
	}];


export  {register, login};