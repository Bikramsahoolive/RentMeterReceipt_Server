function mainBillCreateValidation(req,res,next){

            let data = req.body;
            const {previousUnit,currentUnit,connLoad}= data;
            const dataval = [previousUnit,currentUnit,connLoad];
            const isAvail =dataval.some(val=>val==="");
            if(!('previousUnit' in data &&'currentUnit' in data &&'connLoad' in data)){
                res.send("Invalid fields. [previousUnit, currentUnit, connLoad] Fields should be available.")
            }
            else if(isAvail){
                res.send("field/fields should not be empty.");
        
            }else if((+previousUnit) > (+currentUnit) || (+previousUnit) < 0 ){

                res.send("invalid previousUnit and currentUnit");
            }else if((+connLoad) <0 || (+connLoad) > 5 ){

                res.send("invalid connection load");
            }else{
                 next();
            }
}

function rentBillCreateValidation(req,res,next){
    const data = req.body;
    const {billingDate,totalUnit,totalAmount,previousUnit,currentUnit,adjustUnit,dueAmount,rent,rentholder_id,consumer_Name} = data;

    const dataval = [billingDate,totalUnit,totalAmount,previousUnit,currentUnit,adjustUnit,dueAmount,rent,rentholder_id,consumer_Name]
    const isAvail =dataval.some(val=>val==="");
    if(!('billingDate' in data &&'totalUnit' in data &&'totalAmount' in data &&'previousUnit' in data &&'currentUnit' in data &&'adjustUnit' in data &&'dueAmount'in data &&'rent'in data &&'rentholder_id' in data && 'consumer_Name' in data)){
        res.send("Invalid fields. [billingDate, totalUnit, totalAmount, previousUnit, currentUnit, adjustUnit, dueAmount, rent, rentholder_id, consumer_Name] Fields should be available.")
    }
    else if(isAvail){
        res.send("field/fields should not be empty.");

    }else if((+previousUnit) > (+currentUnit) || (+previousUnit) < 0 ){

        res.send("invalid previousUnit and currentUnit");
    }else if((+totalAmount)<=0||(+totalUnit)<=0){
        res.send("invalid total Unit or total amount.")
    }else if((+rent)<0){
        res.send("invalid rent amount.")
    }else{
        next()
    }
}

function rentBillUpdateValidation(req,res,next){
    const {paid_amt} = req.body;
    if(!paid_amt){
        res.send('Invalid field. [paid_amt] required.')
    }

}

module.exports ={
    mainBillCreateValidation,
    rentBillCreateValidation,
    rentBillUpdateValidation
};