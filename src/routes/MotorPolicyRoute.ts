import express from "express"
import { createMotorPolicy, deleteMotorPolicy, getAllMotorPolicies, getMotorPolicyById, updateMotorPolicy } from "../controllers"
import { Authenticate } from "../middlewares"
import multer from "multer"

const router = express.Router()

//Multer
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'dist/images')
    },
    filename: function (req, file, cb) {
        //Error 2 
        // cb(null, new Date().toISOString() + '_' + file.originalname)
        cb(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname)
    }
})

const images = multer({ storage: imageStorage }).array('images', 10)

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

// /* ------------------- Motor Policy Section --------------------- */
router.get('/MotorPolicies', getAllMotorPolicies)
router.post('/createMotorPolicy', images, createMotorPolicy)
router.delete('/:id', deleteMotorPolicy)
router.post('/:id', updateMotorPolicy)
router.get('/:id', getMotorPolicyById)


export { router as MotorPolicyRoute }