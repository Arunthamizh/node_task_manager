require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const { text } = require('express')
// const sendgridaAPIkey = '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'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.log('(process.env.SENDGRID_API_KEY',process.env.SENDGRID_API_KEY)
const sendWelcomeEmail = (email, name) =>{
sgMail.send({
    to : email,
    from: 'twilightitsolution@gmail.com',
    subject:'Welcome to Task-App',
    text:`welcome to the app ${name}. Let me know how you get along with the app.`
}).then((data)=>{
console.log('Email send',{
    to : email,
    from: 'twilightitsolution@gmail.com',
})
})
}


const removeAccount = (email, name)=>{
sgMail.send({
    to: email,
    from: 'twilightitsolution@gmail.com',
    subject: 'Deleting the account',
    text:`Good bye ${name}!. Why you are deleting your account?`,
    // html:'<h1>Conatus anytime for assestent</h1>'
})
}

module.exports = {
    sendWelcomeEmail,
    removeAccount
}
// const msg = {
//   to: 'twilightitsolution@gmail.com', // Change to your recipient
//   from: 'twilightitsolution@gmail.com', // Change to your verified sender
//   subject: 'Sending with SendGrid',
//   text: 'and easy to do anywhere, even with Node.js',
// //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })