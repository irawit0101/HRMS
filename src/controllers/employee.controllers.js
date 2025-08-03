import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Employee } from "../models/employee.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const employee = await Employee.findById(userId)
        const accessToken = employee.generateAccessToken()
        const refreshToken = employee.generateRefreshToken()

        employee.refreshToken = refreshToken
        await employee.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

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
    const createdEmpl = await Employee.findById(employee._id).select(
        "-password -refreshToken"
    )

    //if new employee does not exist then throw error
    if (!createdEmpl) {
        throw new ApiError(500, "Something went wrong while registering")
    }

    // if none of the above are statisified then we can say that the employee has been successfully added to the mongodb table
    //if so, send status code 200 and and print a message
    return res.status(201).json(
        new ApiResponse(200, createdEmpl, "Employee registered successfully")
    )
        
})

const loginEmpl = asyncHandler(async (req, res) => {
    // to do list 
    // req body --> data
    // check if name and email is available in the req.body
    // compare email and check if user exists
    // check password and give access token
    // give refresh token
    // send secure cookies
    // send response for successfull login


    const {email, name, password} = req.body

    if (!name && !email && !password) {
        throw new ApiError(400, "email or employee name is not provided")
    }    

    const employee = await Employee.findOne({
        $or: [{name}, {email}]
    })

    if (!employee) {
        throw new ApiError(401, "Employee does not exist.")
    }

    const isPasswordValid = await employee.isPassworCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid employee credentials!!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(employee._id)

    const loggedInEmpl = await Employee.findById(employee._id).select("-refreshToken -password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                employee: loggedInEmpl, accessToken, refreshToken
            },
            "Employee is logged in successfully"
        )
    )
})

const logoutEmpl = asyncHandler(async (req, res) => {
    await Employee.findByIdAndUpdate(
        req.employee._id, 
        {
            $set: {
                refreshToken: undefined
            }
        }, 
        {
            new: true
        }
    )

    const options = {
        httpOnly: true, 
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {}, 
            "Employee is logged out"
        )
    )
})

const refreshAccessToken =  asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.cookies

    if (incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    
        const employee = await Employee.findById(decodedToken?._id)
    
        if (!employee) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== employee?.refreshToken) {
            throw new ApiError(401, "incorrect refresh token")
        }
    
        const options = {
            httpOnly: true, 
            secure: true
        }
    
        const {accessToken, newRefreshToken } = await generateAccessAndRefreshToken(employee._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", nmwRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken, newRefreshToken}, 
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(402, "token invalid")
    }
})

const changeCuurentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const employee = await Employee.findById(req.employee?._id)

    const isPasswordCorrect = await employee.isPassworCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    employee.password = newPassword;
    employee.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {},
            "Password changed sucessfully"
        )
    )
})

const getCurrentEmployee =  asyncHandler( async (req, res) => {
    return res.status(200, req.employee, "current employee fetched successfully")
})


const updateAccessDetails = asyncHandler(async (req, res) => {
    const {emp_name, email} = req.body

    if (!emp_name && !email) {
        throw new ApiError(400, "All fields are required")
    }

    const employee = awaitEmployee.findByIdAndUpdate(
        req.employee?._id, 
        {
            $set: {
                emp_name, 
                email
            }
        }, 
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            employee, 
            "details updated successfully"
        )
    )
})


const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "path is not available")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while updating avatar")
    }

    const employee = await Employee.findByIdAndUpdate(
        req.employee?._id, 
        {
            $set: {
                avatar: avatar.url
            }
        }, 
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            employee, 
            "avatar updated successfully"
        )
    )
})

export { 
    registerEmpl, 
    loginEmpl,
    logoutEmpl, 
    refreshAccessToken, 
    isPassworCorrect, 
    getCurrentEmployee, 
    updateAccessDetails, 
    updateAvatar
}