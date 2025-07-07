import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const emplSchema = new Schema({
        emp_id: {
            type: String, 
            required: true, 
            unique: true, 
            index: true, 
            trim: true
        },

        emp_name: {
            type: String, 
            required: true,  
            lowercase:true, 
            trim: true
        }, 

        avatar: {
            type: String, //cloudinary url
            required: true, 
            unique: true, 
            index: true, 
            trim: true
        },

        password: {
            type: String, 
            required: [true, "Password is required"]
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, 
            trim: true 
        },

        emp_type: {
            type: String,
            required: true,
            trim: true
        },

        emp_designation: {
            type: String, 
            required: true, 
            trim: true
        },

        emp_ph: {
            type: Number,
            required: true, 
            unique: true, 
            trim: true
        }, 

        emp_dept: {
            type: String, 
            required: true
        }, 

        refreshToken: {
            type: String
        }
        
}, 
{
    timestamps: true
})

emplSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next
    this.password = bcrypt.hash(this.password, 10)
    next()
})

emplSchema.methods.isPassworCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

emplSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {
        emp_id: this.emp_id,
        email: this.email,
        emp_name: this.emp_name
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

emplSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
    {
        emp_id: this.emp_id,
        email: this.email,
        emp_name: this.emp_name
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Employee = mongoose.model("Employee", emplSchema)