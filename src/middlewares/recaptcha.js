require('dotenv').config();
const axios = require('axios');

const SECRET_KEY = process.env.recapcha_secretKey;

 async function validateCaptcha(req,res,next){

    const { recaptcha, ...data } = req.body;

  if (!recaptcha) {
    return res.status(400).json({ message: 'No reCAPTCHA token provided',status:'failure' });
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const params = new URLSearchParams();
    params.append('secret', SECRET_KEY);
    params.append('response', recaptcha);
    

    const googleRes = await axios.post(verifyUrl, params);
    const data = googleRes.data;
    // console.log(data);
    

    if (data.success) {
        next();
        } else {
      return res.status(400).json({ message: 'reCAPTCHA failed', status:'failure' });
    }
    
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'reCAPTCHA failed',status:'failure' });
  }

}

module.exports = validateCaptcha;