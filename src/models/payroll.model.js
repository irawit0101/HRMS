import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const payrollSchema = new Schema({

    emp_id: {
        type: Schema.types.ObjectId,
        ref: "Employee", 
        required: true
    },

    payment_id: {
        type: String,
        required: true, 
        unique: true, 
        trim: true, 
    }, 

    emp_name: {
        type: Schema.types.ObjectId, 
        ref: "Employee", 
        required: true
    }, 

    total_earnings: {
        type: Number, 
        required: true 
    },

    total_deductions: {
        type: Number, 
        required: true
    }, 

    netpay: {
        type: Number, 
        required: true
    }, 

    pay_period: {
        type: Number, 
        required: true
    }, 

    payslip: {
        type: String,  //cloudinary url
        required: true, 
        trim: true
    }

}, {timestamps: true})

payrollSchema.plugin(mongooseAggregatePaginate)

export const Payroll = mongoose.model("Payroll", payrollSchema)
