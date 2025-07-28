import {Router} from "express" ;
import { loginEmpl, logoutEmpl, registerEmpl, refreshAccessToken } from "../controllers/employee.controllers.js" ;
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),    
    registerEmpl
)

router.route("/login").post(loginEmpl)


//secured routes
router.route("/logout").post(verifyJWT, logoutEmpl)

router.route("/refresh-token").post(refreshAccessToken)


export default router