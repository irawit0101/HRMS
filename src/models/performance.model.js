import { defaultFormat } from "moment";
import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const performanceSchema = new Schema({

    emp_id: {
        type: Schema.Types.ObjectId, 
        ref: "Employee"
    }, 

    reviewer_id: {
        type: Schema.Types.ObjectId, 
        ref: "Employee"
    }, 

    start_period_date: {
        type: Date, 
        required: true
    }, 

    
    end_period_date: {
        type: Date, 
        required: true
    }, 

    
    review_date: {
        type: Date, 
        required: true
    }, 

    goals_set: {
        type: Array, 
        required: true
    }, 

    goals_achieved: {
        type: Array, 
        required: true
    }, 

    completion_percentage: {
        type: Number, 
        required: true, 
        default: "0" 
    }, 

    manager_feedback: {

        type: String, 
        trim: true
    }, 

    development_needs: {

        type: String 
    }, 

    promotion_recommended: {

        type: Boolean, 
        required: true, 
        default: "false"
    }, 

    training_recommended: {

        type: Boolean, 
        required: true, 
        default: "false"
    }, 

    review_status: {

        type: String,
        required: true,
        trim: true, 
        default: "Pending"
    }

}, {timestamps: true})

performanceSchema.plugin(mongooseAggregatePaginate)

export const performance = mongoose.model("performance", performanceSchema)