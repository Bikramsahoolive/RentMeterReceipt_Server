const {initializeApp} = require('firebase/app');

require('dotenv').config();


const firebaseConfig = {
    apiKey: process.env.firebase_apikey,
    authDomain:process.env.firebase_auth_domain,
    databaseURL: process.env.firebase_database_url,
    projectId: process.env.firebase_project_id,
    storageBucket: process.env.firebase_stroage_bucket,
    messagingSenderId: process.env.firebase_messaging_sender_id,
    appId: process.env.firebase_app_id
  };
   
     
  const firebase = initializeApp(firebaseConfig);


  module.exports = firebase;