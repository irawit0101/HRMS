 import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema = new Schema({

    interviewer_id: {
        type: Schema.Types.ObjectId, 
        ref: "Employee"
    }, 

    job_id: {

        type: Number, 
        required: true, 
        index: true, 
        unique: true

    }, 

    candidate_id: {

        type: Number, 
        required: true, 
        unique: true, 
        index: true
    }, 

    application_id: {

        type: number, 
        required: true, 
        unique: true, 
        index: true 
    }, 

    current_stage: {
        type: String, 
        required: true, 
        trim: true
    }, 

    resume: {

        type: String,  //cloudinary url
        required: true, 
        trim: true, 
        unique: true
    }, 

    coverLetter: {
        type: String, //cloudinary url
        trim: true
    }
}, 
{
    timestamps: true
})

applicationSchema.plugins(mongooseAggregatePaginate)

export const application = mongoose.model("application", applicationSchema)