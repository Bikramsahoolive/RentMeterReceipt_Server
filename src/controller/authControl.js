function checkRouter(req,res){
    let data = req.session.key;
  if(data === undefined){
    res.send({
      isActive:false,
      message:"login required."
    });
  }else if(data.expairTime < Date.now()){
    req.session.destroy(err => {
      if (err) {
          res.send(err);
      } else {
          res.send({
              isActive: false,
              message: "session expired"
          });
      }
  });
  }else{
    data.expairTime = Date.now() + 300000;
    req.session.key = data;
    res.send(data);
  }
}

function landlordLogout(req, res) {
    req.session.destroy(err => {
        if (err) {
            res.send(err);
        } else {
            res.send({
                isActive: false,
                message: "Logout Successful."
            });
        }
    });
}


module.exports={
    checkRouter,
    landlordLogout
}