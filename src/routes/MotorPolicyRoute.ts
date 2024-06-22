import express from "express"
import { createMotorPolicy, deleteMotorPolicy, getAllMotorPolicies, getMotorPolicyById, imageHandler, updateMotorPolicy } from "../controllers"
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
// const imageUploadSingle = multer({ storage: imageStorage, limits: { fileSize: 1024 * 1024 * 5 } }); // Set a limit of 5MB for uploaded files
const imageUpload = multer({ storage: imageStorage })

// const handleImageUpload = imageUpload.single('lpo')

const handleImageUpload = imageUpload.fields([
    { name: 'mulkiya_Hayaza', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'emiratesID', maxCount: 1 },
    { name: 'mulkiya', maxCount: 1 },
    { name: 'lpo', maxCount: 1 },
    { name: 'drivingLicense_1', maxCount: 1 },
    { name: 'hayaza_1', maxCount: 1 },
    { name: 'passing_1', maxCount: 1 },
    { name: 'others_1', maxCount: 1 },
    { name: 'lpo_1', maxCount: 1 }
])

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

// /* ------------------- Motor Policy Section --------------------- */
router.post('/createMotorPolicy', createMotorPolicy)
router.post('/createMotorPolicy/:id', handleImageUpload, imageHandler)
router.get('/motorPolicies', getAllMotorPolicies)
router.get('/:id', getMotorPolicyById)
router.delete('/:id', deleteMotorPolicy)
router.patch('/:id', updateMotorPolicy)


export { router as MotorPolicyRoute }