const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User  = require('../models/user')
const auth = require('../middleware/auth');
const router = express.Router();
var bcrypt = require('bcryptjs');
const { sendWelcomeEmail, removeAccount } = require('../emails/account');

// User endpoint
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    // user.save().then(()=>{
    //     return res.status(201).send(user);
    // }).catch((e)=>{
    //     res.status(400).send(e)
    //     // res.send(e);
    // })
    
    try { 
        await user.save()
        console.log('before email')
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()        
        res.status(201).send({user, token})
        // console.log('test before create') 
    } catch (e) {
        res.status(400).send(e); 
    }
});

router.post('/users/login', async(req, res) => {
    try {
    // findByCredentials will call schemas  function in the user model userSchema.statics.findByCredentials
        const user = await User.findByCredentials(req.body.email, req.body.password);
        debugger
        const token = await user.generateAuthToken()
        res.send({user,token});
        
        // const user = await User.find({email:req.body.email});
        // const loginPassword = bcrypt.hash(req.body.password, 8)
        // const password = bcrypt.compare(loginPassword,user.password)
        //  if(!password){
        //      res.send('error: Wrong password')
        //  }
        //  res.send('Successfully logIn')
    } catch (error) {
     res.status(400).send(error)
    }
});

router.post('/users/logout', auth,  async(req, res) => {
    try {
        debugger
        req.user.tokens = req.user.tokens.filter((token)=>{
            return  token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(); 
    }
return 	
}); 

router.post('/users/logoutAll', auth, async (req, res) => {
     try {
        req.user.tokens = []
        await req.user.save()
        res.send()
     } catch (error) {
         res.status(500).send()
     }
return 	
});

router.get('/users/me', auth, (req, res) => {

    // User.find({}).then((data)=>{
    //     return res.status(200).send(data);
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })

    // try {
    //     const user = await User.find({})
    //     if (!user) return res.status(404).send();
    //     res.send(user)
    // } catch (e) {
    //     res.send(e)
    // }
    res.send(req.user)
     
});

// access specfic user by ID using route handler
//  ** ROUTE PARAMETER :id

// router.get('/users/:id', async (req, res) => {

//     // console.log(req.params);
//     const _id = req.params.id;
//     // User.findById(_id).then((user)=>{
//     //     debugger
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     return res.send(user);
//     // }).catch((e)=>{
//     //     debugger
//     //     res.status(500).send(e)
//     // })

//     try {
//         const data = await User.findById(_id);
//         if (!data) return res.status(404).send()
//         console.log('data', data)
//         res.send(data);
//     } catch (e) {
//         res.send(e);
//     }
// });



// update
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    // mention the allowed fields to update
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isVaildupdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isVaildupdate) {
        return res.status(400).send('error:Invid updates')
    }

    // *****
    try {       
        // const user = await User.findById(req.params.id)
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save();
        // findByIdAndUpdate this method bypass the mongoose  it perform direct opettin on mongoose                                             // the new: true means it return the update values                  
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // if (!user) return res.status(404).send()
        // below is the existing data with update applied
        res.send(req.user)
    } catch (error) {                                                         //the runValidators : true means run the validation models if fails not allow to updata                                                         
        res.status(400).send(error)
    }
});

// delete
// router.delete('/users/:id', auth, async (req, res) => {
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     re   turn res.status(404).send()
        // }
        console.log('before email call')
        removeAccount(req.user.email, req.user.name)
       await req.user.remove()
       console.log('user deleted success')
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error);
    }
});

const avatar  = multer({
    // dest: 'avatar',
    limits: {
        fileSize: 1000000
    },
     fileFilter (req, file, cb) {
        // if(!file.originalname.endsWith('.pdf')){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
         return cb(new Error('Please upload the jpg|jpeg|png file'))
            
        }
    
        // cb(null, false)
       
        cb(null, true)
       
      }
}); 
router.post('/user/me/avatar', auth, avatar.single('avatar'), async (req, res) => {
    const  buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    //  req.user.avatar = req.file.buffer
    req.user.avatar  = buffer
    await req.user.save()
    res.send();
},(error, req, res, next) =>{
    res.status(400).send({error:error.message})
}); 
// <img src="data:image/png;base64,base64"> 

router.delete('/user/me/avatar', auth, async(req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/user/:id/avatar', async (req, res) => {

    try {                                   
        const user = await User.findById(req.params.id)
        if(!user){
            throw new Error()
        }
        res.set('content-Type','image/png')
        res.send(user.avatar)
    } catch (err) {
        
    }
});
module.exports = router


