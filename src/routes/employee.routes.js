import {Router} from "express" ;
import { registerEmpl } from "../controllers/employee.controllers.js" ;
import {upload} from "../middlewares/multer.middlewares.js"


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


export default router