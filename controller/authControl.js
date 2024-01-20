function checkRouter(req,res){
    let data = req.session.key;
  if(data){
    res.send(data);
  }else{
    res.send({
      isActive:false,
      message:"login required."
    })
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