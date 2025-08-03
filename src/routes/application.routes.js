import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createApplication,
    updateApplicationStage,
    getApplicationById,
    getAllApplications,
    deleteApplication
} from "../controllers/application.controllers.js";

const router = Router();

// Secure all routes with JWT authentication
router.use(verifyJWT);

// Application routes
router.route("/create")
    .post(
        upload.fields([
            {
                name: "resume",
                maxCount: 1
            },
            {
                name: "coverLetter",
                maxCount: 1
            }
        ]),
        createApplication
    )
    .get(getAllApplications);

router.route("/:applicationId")
    .get(getApplicationById)
    .patch(updateApplicationStage)
    .delete(deleteApplication);

export default router;