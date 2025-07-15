import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Employee } from "../models/employee.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerEmpl = asyncHandler( async (req, res) => {
    
    //get employee details from postman/frontend
    //validation(check if the detail provided is valid or not)
    //check if employee already exists(from email and employee name)
    // check for images and avatar--> upload them on cloudinary-->check avtar
    //create employee object-->create entry in db.
    //remove pasword and refresh token field from response
    //check for employee creation--> return res

    //create a request body
    const {emp_name, email,
          password, emp_type,
          emp_designation, emp_ph,
          emp_dept} = req.body

    console.log("email:", email);
    
    // Check if all the required fields are provided by the user and if not then throw an error
    if (
        [emp_name, email,
         password, emp_type,
         emp_designation, emp_ph,
         emp_designation, emp_dept].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Name of the employee is mandatory!!")
    }


    //check if the registering employee already exists or not
    const existedEmployee = await Employee.findOne({
        $or: [{emp_name}, {email}]
    })

    //if employee already exists then throw an error
    if (existedEmployee){
        throw new ApiError(409,
            "Employee with provided name or email already exists"
        )
    }

    //inputs in text format are done, now uploading files will be controlled
    //fetch path of file from local storage from multer
    const avatarLocalPath = req.files?.avatar[0]?.path;

    //if avatar is not uploaded then throw error 
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar is required field")
    }
    console.log(avatarLocalPath);
    
    //upload the file on cloudinary and save its referrence
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    //throw error in case of unsuccessful file upload
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //insert the employee in mongodb
    const employee = await Employee.create({
        emp_name, 
        avatar: avatar.url, 
        email, 
        password, 
        emp_type, 
        emp_ph, 
        emp_designation, 
        emp_dept
    })

    //check if new employee exists in the table or not
    const createdEmpl = await Employee.findById(Employee._id).select(
        "-password -refreshToken"
    )

    //if new employee does not exist then throw error
    if (!createdEmpl) {
        throw new ApiError(500, "Soemthing went wrong while registering")
    }

    // if none of the above are statisified then we can say that the employee has been successfully added to the mongodb table
    //if so, send status code 200 and and print a message
    return res.status(201).json(
        new ApiResponse(200, createdEmpl, "Employee registered successfully")
    )
        
})

 export { registerEmpl }