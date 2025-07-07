import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const leaveSchema = new Schema({

    leave_id: {
        type: Number, 
        required: true, 
        trim: true, 
    }, 

    emp_id: {
        type: Schema.Types.ObjectId,
        ref: "Employee"
    }, 

    emp_name: {
        type: Schema.Types.ObjectId,
        ref: "Employee"
    },

    attendance: {
        type: Number, 
        required: true, 
        trim: true
    }, 

    leave_type: {
        type: String, 
        required: [true, "vacation, sickday or emergency"] 
    },

    start_date: {
        type: Date, 
        requirted: true
    }, 

    end_date: {
        type: Date, 
        required: true
    }, 

    leave_status: {
        type: String, 
        required: [true, "Applied, under process or Approved"],
        trim: true
    }, 

    is_paid: {
        type: Boolean, 
        required: true
    }, 

    is_halfday: {
        type: Boolean, 
        required: true
    }, 

    attachments: {
        type: String,  //cloudiinary url
        required: [true, "doctor's prescription, flight tickets, receipts, etc."]
    }

}, {timestamps: true})

leaveSchema.plugins(mongooseAggregatePaginate)

export const leaves = mongoose.model("leaves", leaveSchema)