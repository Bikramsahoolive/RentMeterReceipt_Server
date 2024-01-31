function rentBillCalc (value){
    const {billingDate,totalUnit,totalAmount,previousUnit,currentUnit,adjustUnit,dueAmount,rent} = value;

    
       
        let aunit = (+currentUnit) + (+adjustUnit);
        let perunit = (totalAmount/totalUnit);
        perunit = perunit.toFixed(2);
        let unit=  aunit-previousUnit;
        let meteramount= unit*perunit;
        let billamount = Math.trunc(meteramount);

        value.perunit= perunit;
        value.unitAdv = JSON.stringify(unit);
        value.eBill = JSON.stringify(billamount);
        

        
        let finalAmount = billamount+(+rent)+(+dueAmount);
        value.final_amt = JSON.stringify(finalAmount);
        value.paid_amt = "0";
        
        const firstDate = new Date(billingDate);
            firstDate.setDate(firstDate.getDate());
            let day1 = String( firstDate.getUTCDate()).padStart(2,'0');
            let month1 = String( firstDate.getUTCMonth() + 1).padStart(2,'0');
            let year1 = firstDate.getUTCFullYear();
            billDate = day1+"-"+month1+"-"+year1;


        const newDate = new Date(billingDate);
            newDate.setDate(newDate.getDate() + 6);
            let day = String( newDate.getUTCDate()).padStart(2,'0');
            let month = String( newDate.getUTCMonth() + 1).padStart(2,'0');
            let year = newDate.getUTCFullYear();
            lastDate = day+"-"+month+"-"+year;

            value.billingDate = billDate;
            value.dueDate = lastDate;

            return value;

}

module.exports=rentBillCalc;