import express from "express"
import { createMotorPolicy, deleteMotorPolicy, getAllMotorPolicies, getMotorPolicyById, updateMotorPolicy } from "../controllers"
import { Authenticate } from "../middlewares"
import multer from "multer"

const router = express.Router()

//Multer
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'dist/images'); // Destination directory for uploaded images
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate unique timestamp + random number
        const originalExt = file.originalname.split('.').pop(); // Extract original file extension
        cb(null, uniqueSuffix + '.' + originalExt); // Combine unique suffix and original extension
    }
})

const imageUpload = multer({ storage: imageStorage })

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

// /* ------------------- Motor Policy Section --------------------- */
router.get('/MotorPolicies', getAllMotorPolicies)
router.post('/createMotorPolicy', imageUpload.any(), createMotorPolicy)
router.delete('/:id', deleteMotorPolicy)
router.post('/:id', updateMotorPolicy)
router.get('/:id', getMotorPolicyById)


export { router as MotorPolicyRoute }