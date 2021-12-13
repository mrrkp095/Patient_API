import mongoose from "mongoose";

var AccountSchema = new mongoose.Schema({
	firstName: {type: String, required: false},
	lastName: {type: String, required: false},
	age: {type: Number, required: false},
	mobileNumber: {type: Number, required: true},
	genderCd: {type: String, required: false},
	otp:{type:Number,required:true},
	checkbox: { type: Boolean, required: true},
}, {timestamps: true});


export default mongoose.model("Account", AccountSchema);



