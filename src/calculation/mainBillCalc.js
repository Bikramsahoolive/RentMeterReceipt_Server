
function mainBill(value){
    t;
let crntUnit = value.currentUnit;
let cload = value.connLoad;

let unitAdv = crntUnit-prevUnit;

let prevUnit = value.previousUni
value.unitAdvance = JSON.stringify(unitAdv);

    let rebtUnit = unitAdv;
    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;

    

    if(unitAdv<=50){
        a = unitAdv * 3;
        unitAdv = 0;
    }else{
        a = 50*3;
        unitAdv -= 50;
    }

    // console.log("50u Amount "+a);
    // console.log("Reamining Unit "+unitAdv);
    if(unitAdv<=150){
        b = unitAdv * 4.8;
        unitAdv = 0;
    }else{
        b = 150 *4.8;
        unitAdv -=150;
    }

    // console.log("150u Amount "+b);
    // console.log("Remaining Unit "+unitAdv);

    if(unitAdv<=200){
        c = unitAdv*5.8;
        unitAdv = 0;
    }else{
        c = 200 * 5.8;
        unitAdv -=200;
    }

    // console.log("200u Amount "+c);
    // console.log("Remaining Unit "+unitAdv);

    d = unitAdv * 6.2;
    unitAdv = 0;

    // console.log("Above 200u Amount"+d);
    // console.log("Remaining Unit "+unitAdv);

    let basecharge = a+b+c+d;
    basecharge = basecharge.toFixed(2);

    // console.log("Total Amount "+basecharge);
    value.consuptionAmount = basecharge;
    
    
    let eDuty = +basecharge*0.04;
    let elecDuty = eDuty.toFixed(2);
    let fixedCharge = cload * 10;
    // console.log("Fixed Charge "+fixedCharge);
    // console.log("Electric Duty "+eDuty);
    
    value.fixedCharge = JSON.stringify(fixedCharge);
    value.electricDuty = elecDuty;
    

    let totalTax = eDuty + fixedCharge;
    totalTax = totalTax.toFixed(2);

    // console.log("total tax "+totalTax);
    value.totalTax = totalTax;

    let amtAfterTax = +basecharge + (+totalTax);

    amtAfterTax = amtAfterTax.toFixed(2);
    
    value.taxableAmount = amtAfterTax;
    // console.log("After tax amount "+amtAfterTax);




    let promtRebt = rebtUnit*0.10;
    promtRebt = promtRebt.toFixed(2);

    value.dueDateRebt = promtRebt;
    // console.log("Due Date Rebet "+promtRebt);


    let amtAfterDuedate = amtAfterTax - (+promtRebt) ;

    amtAfterDuedate = amtAfterDuedate.toFixed(2);

    value.afterDueDateRebt = amtAfterDuedate;
    // console.log("Amount After Due Date rebt "+amtAfterDuedate);

    let digiRebt = basecharge * 0.041;//0.0395

    digiRebt = digiRebt.toFixed(0);

    value.digitalRebt = digiRebt;
    // console.log("Digital Payment Rebt "+digiRebt);

    let amtAfterdigiRebt = +amtAfterDuedate - digiRebt;

    amtAfterdigiRebt = amtAfterdigiRebt.toFixed(0);    

    value.afterDigitalRebt = amtAfterdigiRebt
    // console.log("Amount After Digital Payment rebt "+ +amtAfterdigiRebt);

    return value;

}


module.exports={mainBill};