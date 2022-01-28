const auth = require('../Authentication')
const auth2 = require('../Auth2')
const { getAllUser, createUser, getUserById, updateUserById, deleteUserById, login,sendUserEmail,optVerify,getUserByName,sendUserEmailLink,getUserByEmail,checkUserPresentByEmail } = require('../controller/user')

const router = require('express').Router()

router.get('/',auth,getAllUser)

router.get('/:id',getUserById)
router.get('/getByName/:name',getUserByName)
router.post('/register',createUser)
router.post('/email',sendUserEmail)
router.post('/emaillink',sendUserEmailLink)

router.get('/emaillink/:email',auth2,getUserByEmail) // update to verify

router.post('/verify',optVerify)
router.post('/login',login)
router.put('/:id',updateUserById)
router.delete('/:id',deleteUserById)

router.get("/checkuserpresent/:email",checkUserPresentByEmail)
 

module.exports = router