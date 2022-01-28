const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('../basicapi-567f7-268f006dafe7.json');
const sendMail = require('../email');

const jwt = require('jsonwebtoken')


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();



getAllUser = async (req,res)=>{

    const snapshot = await db.collection('users').get();
    let data = []

    snapshot.forEach((doc) => {
    //   console.log(doc.id, '=>', doc.data());
      data.push(doc.data()) 
    });
    user = req.user.username

    res.json({data,user})
 
}

generateOtp = () =>{
    let otp = Math.random()
    otp = otp * 1000000
    return parseInt(otp)
}




optVerify = async (req,res)=>{
    console.log(otp)
    if(req.body.otp == otp){
        res.json("User Verified")
    } else {
        res.json("Not Verified")
    }
}

var otp 
setOtp = (oldOtp) =>{
    otp = oldOtp
} 
 
sendUserEmail = async (req,res)=>{
    var otp = generateOtp()
    setOtp(otp)
    await sendMail(req.body.email,otp)
    res.json("check your email")
}

sendUserEmailLink = async (req,res)=>{ 
    let link = `http://localhost:4000/api/user/emaillink/${req.body.email}?authorization=${req.body.token}`
    
    await sendMail(req.body.email ,link )
    res.json("Check Your Email link has been send..")
} 


getUserByEmail = async (req,res)=>{
    data = []
    id = 0
    const user = await db.collection('users').where('email', '==',req.params.email).get()
    user.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
          data.push(doc.data())
          id =  doc.id 
        });

        await db.collection('users').doc(id).update({
            'Verify':true 
        });

        Verify = "You Are Verified"
    res.json({Verify,id})
}



// it will check if user is present or not by email 
checkUserPresentByEmail = async (req,res)=>{
    data = []
 
    const user = await db.collection('users').where('email', '==',req.params.email).get()
    user.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
          data.push(doc.data())
        
        });

    res.json({data})
}









createUser = async (req,res)=>{  /// id required...
    const mydata = await db.collection('users').doc(req.body.id);
     
    mydata.set({  // it will add data to db
        'first': req.body.first,
        'middle': req.body.middle,
        'last': req.body.last,
        'born': req.body.born, 
        'email':req.body.email,
        'password':req.body.password,
        
    })
    
    const token = jwt.sign({username:req.body.first},process.env.SECRET_KEY,{expiresIn:"3d"})
   

    res.json({msg:"Data created Successfull just check you mail ..!",token,name:req.body.first})
   
}


// createUser = async (req,res)=>{  /// id required...

//     const mydata = await db.collection('users').doc(req.body.id);
//     mydata.set({
//         'first': req.body.first,
//         'middle': req.body.middle,
//         'last': req.body.last,
//         'born': req.body.born, 
//         'email':req.body.email,
//         'password':req.body.password
//     })
    
//     const token = jwt.sign({username:req.body.first},process.env.SECRET_KEY,{expiresIn:"3d"})
//     await sendMail(req.body.email,token,otp)

//     res.json({msg:"Data created Successfull just check you mail ..!",token})
   
// }




const login = async (req,res)=>{  // where

    const {email, password} = req.body

    if(!email || !password){
        res.send("Please provide email password")
        return
    }

    data = []
    const user = await db.collection('users').where('email', '==',email).where('password','==',password).get(); // it will find user by email and password
    
    
    user.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
          data.push(doc.data()) 
        });
    console.log(data) // if lot of data is comming 

    if(data.length){   // ==1
        const token = jwt.sign({username:data[0].first},process.env.SECRET_KEY,{expiresIn:"3d"}) // creating a token 
        res.json({msg:"You login Successfully ..!",token,name:data[0].first})
    }
    else{
        res.json("Invalid User")
    }
}

getUserByName = async (req,res)=>{
    data = []
    id = 0
    const user = await db.collection('users').where('first', '==',req.params.name).get()
    user.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
          data.push(doc.data())
          id =  doc.id 
        });

    res.json({data,id})
}

getUserById = async (req,res)=>{

    const oneData = await db.collection('users').doc(req.params.id).get();

    res.send(oneData.data())
}


updateUserById = async (req,res)=>{

    await db.collection('users').doc(req.params.id).update({
        'first': req.body.first,
        'middle': req.body.middle,
        'last': req.body.last,
        'born': req.body.born,
        'email':req.body.email || "",
        'password':req.body.password || "",
        'twoFaceVerification':req.body.twoFaceVerification  || false,
        "srcData":req.body.srcData || ""
    });

    res.send("Data Updated Successfully ..!")
} 


deleteUserById = async (req,res)=>{

    await db.collection('users').doc(req.params.id).delete(); 
    res.send("Delete Successfully...")
}


module.exports = {
    getAllUser,
    createUser,
    getUserById,
    deleteUserById,
    updateUserById,
    login,
    sendUserEmail,
    optVerify,
    getUserByName,
    sendUserEmailLink,
    getUserByEmail,
    checkUserPresentByEmail
}

