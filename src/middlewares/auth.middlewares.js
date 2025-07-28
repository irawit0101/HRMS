import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Employee } from "../models/employee.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //here, because of unknown logical error, decodedToken does not contain emp_id
        //therefore, i will have to find the employee by using its email
        //(since it is available in decodedToken and it is unique too)
        //i printed decodedToken to see what does it contain
        // findOne only accepts objects, so i had to store the email in a variable and then use it 

        const email = decodedToken.email
        const employee = await Employee.findOne({ email }).select("-password -refreshToken")
        
        
        if(!employee) {
            throw new ApiError(401, "Employee does not exist")
        }
     
        req.employee = employee;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})