require('dotenv').config();
const axios = require('axios');

 function sendMail(res,emailObject){

const scriptUrl = process.env.mail_script_url;

////////  By axios  //////
const data = new URLSearchParams();
data.append('recipient', emailObject.email);
data.append('subject', emailObject.subject);
data.append('body', emailObject.content);
data.append('isHTML', true);
  axios.post(scriptUrl, data)
    .then(response => {
        // console.log('Response:', response.data);
        if(res!==null){
            res.send(response.data);
        }
            
        
        
    })
    .catch(error => {
        console.error('Error:', error.message);
        if(res!==null){
            res.send(error);
        }
        
        
    });
}

module.exports = sendMail;