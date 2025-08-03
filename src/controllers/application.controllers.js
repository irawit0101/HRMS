import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createApplication = asyncHandler(async (req, res) => {
    const {
        job_id,
        candidate_id,
        application_id,
        current_stage
    } = req.body;

    // Validate required fields
    if (!job_id || !candidate_id || !application_id || !current_stage) {
        throw new ApiError(400, "All fields are required");
    }

    // Handle resume upload
    const resumeLocalPath = req.files?.resume[0]?.path;
    if (!resumeLocalPath) {
        throw new ApiError(400, "Resume file is required");
    }

    // Upload resume to Cloudinary
    const resumeFile = await uploadOnCloudinary(resumeLocalPath);
    if (!resumeFile) {
        throw new ApiError(400, "Resume upload failed");
    }

    // Handle cover letter if provided
    let coverLetterUrl;
    if (req.files?.coverLetter) {
        const coverLetterLocalPath = req.files.coverLetter[0].path;
        const coverLetterFile = await uploadOnCloudinary(coverLetterLocalPath);
        coverLetterUrl = coverLetterFile?.url;
    }

    // Create application
    const application = await Application.create({
        interviewer_id: req.employee?._id, // Assuming logged in employee is the interviewer
        job_id,
        candidate_id,
        application_id,
        current_stage,
        resume: resumeFile.url,
        coverLetter: coverLetterUrl
    });

    return res.status(201).json(
        new ApiResponse(201, application, "Application created successfully")
    );
});

const updateApplicationStage = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { current_stage } = req.body;

    if (!current_stage) {
        throw new ApiError(400, "New stage is required");
    }

    const application = await Application.findByIdAndUpdate(
        applicationId,
        {
            $set: { current_stage }
        },
        { new: true }
    );

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application stage updated successfully")
    );
});

const getApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
        .populate("interviewer_id", "emp_name email");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

const getAllApplications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, stage } = req.query;

    const filter = {};
    if (stage) {
        filter.current_stage = stage;
    }

    const applications = await Application.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "employees",
                localField: "interviewer_id",
                foreignField: "_id",
                as: "interviewer"
            }
        },
        {
            $unwind: "$interviewer"
        }
    ]).skip((page - 1) * limit).limit(limit);

    return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

const deleteApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    const deletedApplication = await Application.findByIdAndDelete(applicationId);

    if (!deletedApplication) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Application deleted successfully")
    );
});

export {
    createApplication,
    updateApplicationStage,
    getApplicationById,
    getAllApplications,
    deleteApplication
};