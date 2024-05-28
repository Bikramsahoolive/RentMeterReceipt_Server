function checkRouter(req, res) {
  // let data = req.session.key;
  const jwt = require('jsonwebtoken');
  const secretKey = process.env.sess_secret;
  try {
    if(req.cookies.sid){
      let data = jwt.verify(req.cookies.sid, secretKey);

    if (Date.now() > data.expairTime) {

      res.cookie('sid','', {sameSite:'None',secure:true});
      res.send({
        isActive: false,
        message: "session expired."
      });


    } else {
      data.expairTime = Date.now() + 600000;
      // req.session.key = data;
      let token = jwt.sign(data, secretKey);
      res.cookie('sid', token,{sameSite:'None',secure:true});
      // next();
      res.send(data);
    }

    }
    

  } catch (error) {
    
    console.log("Not Veryfied.",error);

    res.send({
      isActive: false,
      message: "login required."
    });

  }



  // if(data === undefined){
  //   res.send({
  //     isActive:false,
  //     message:"login required."
  //   });
  // }else if(data.expairTime < Date.now()){
  //   req.session.destroy(err => {
  //     if (err) {
  //         res.send(err);
  //     } else {
  //         res.send({
  //             isActive: false,
  //             message: "session expired"
  //         });
  //     }
  // });
  // }else{
  //   data.expairTime = Date.now() + 600000;
  //   req.session.key = data;
  //   res.send(data);
  // }
}

function landlordLogout(req, res) {
  // req.session.destroy(err => {
  //     if (err) {
  //         res.send(err);
  //     } else {
  //         res.send({
  //             isActive: false,
  //             message: "Logout Successful."
  //         });
  //     }
  // });

  res.cookie('sid', '', {sameSite:'None',secure:true});
  res.send({
    isActive: false,
    message: "Logout Successful."
  });

}


module.exports = {
  checkRouter,
  landlordLogout
}