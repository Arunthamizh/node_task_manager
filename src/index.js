const app  = require('./app');
const port = process.env.PORT 
app.listen(port, () => {
    console.log(`Server started on port` + port);
});
// parse the incomming JSON data  to object we accept it in request 

// app.use((req, res, next)=>{
//     res.status(503).send('The site is under maintanance please try back soon')
// });



// const multer = require('multer');

// const upload = multer({
//     dest:'images'
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
//     return 	
// });




