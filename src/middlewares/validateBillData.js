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
    console.log('middleware');
    const {billingDate,totalUnit,totalAmount,previousUnit,currentUnit,adjustUnit,dueAmount,rent,rentholder_id,consumer_Name,water_bill,electric_status,eBill,perunit} = data;

    const dataval = [billingDate,totalUnit,totalAmount,previousUnit,currentUnit,rent,rentholder_id,consumer_Name,electric_status,water_bill,dueAmount,adjustUnit]
    const isAvail =dataval.some(val=>val==="");
    if(!('billingDate' in data &&'totalUnit' in data &&'totalAmount' in data &&'previousUnit' in data 
        &&'currentUnit' in data &&'adjustUnit' in data &&'dueAmount'in data &&'rent'in data &&'rentholder_id' in data 
        && 'consumer_Name' in data && 'eBill' in data && 'electric_status' in data && 'perunit' in data && 'water_bill' in data)){
            console.log('1');
        res.send("Invalid fields. [billingDate, totalUnit, totalAmount, previousUnit, currentUnit, adjustUnit, dueAmount, rent, rentholder_id, consumer_Name] Fields should be available.")
    }
    else if(isAvail){
        console.log('2');
        res.send("field/fields should not be empty.");

    }
    else if((+rent)<0){
        console.log('6');
        res.send("invalid rent amount.");
    }else if(water_bill<0){
        console.log('7');
        res.send("invalid water bill amount.");
    }
    else if(electric_status==='mmbd'){
        console.log('3');
        if(totalAmount===''||totalAmount===null ||totalUnit===''||totalUnit===null || (+totalAmount)<=0 ||(+totalUnit)<=0){
            res.status(400).send("invalid total Unit or total amount.");
        }else if((+previousUnit) > (+currentUnit) || (+previousUnit) < 0 ){
            res.send("invalid previousUnit and currentUnit");
        }else{
            next();
        }
    }else if(electric_status==='pu'){
        console.log('4');
        if(perunit<0){
            res.send("invalid per Unit Value");
        }else if((+previousUnit) > (+currentUnit) || (+previousUnit) < 0 ){
            res.send("invalid previousUnit and currentUnit");
        }else{
            next();
        }
    }else if(electric_status==='am'){
        console.log('5');
        if(eBill<0){
            res.send("invalid electric bill Amount");
        }else{
            next();
        }
        
    }
    else{
        next()
    }
}

function rentBillUpdateValidation(req,res,next){
    const data =req.body;
    const {paid_amt ,fine_type,fine_amt} = data;
    const dataval = [paid_amt,fine_type,fine_amt];
    const isAvail =dataval.some(val=>val==="");
     if(isAvail){
        res.send("field/fields should not be empty.");
    }else{
        next();
    }

}

module.exports ={
    mainBillCreateValidation,
    rentBillCreateValidation,
    rentBillUpdateValidation
};