require('dotenv').config();
const {mailScripter} = require('mailscripter');

const mailer = new mailScripter(process.env.mail_script_url);
module.exports = mailer;