function rentBillCalc (value){
    const {billingDate,totalUnit,totalAmount,previousUnit,currentUnit,adjustUnit,dueAmount,rent,electric_status,perunit,eBill,maintenance,water_bill,service} = value;

    
       if(adjustUnit===''||adjustUnit===null)value.adjustUnit=0;
       if(dueAmount===''||dueAmount===null)value.dueAmount=0;
       if(water_bill===''||water_bill===null)value.water_bill=0;
       


       function ebillAmount(){
            if(electric_status==='pa'){
                value.currentUnit = previousUnit;
                return {billamount:0,unitAdvance:0,perUnit:0};
            }
            if(electric_status==='mmbd'){
                let aunit = (+currentUnit) + (+adjustUnit);
                let perunitVal = (totalAmount/totalUnit);
                perunitVal = perunitVal.toFixed(2);
                let unit=  aunit-previousUnit;
                let meteramount= unit*perunitVal;
                let ebillFinal = Math.trunc(meteramount);
                return {billamount:ebillFinal,unitAdvance:unit,perUnit:perunitVal};
                
            }
            if(electric_status==='pu'){
                let aunit = (+currentUnit) + (+adjustUnit);
                let perunitVal = perunit;
                perunitVal = perunit.toFixed(2);
                let unit=  aunit-previousUnit;
                let meteramount= unit*perunitVal;
                let ebillFinal = Math.trunc(meteramount);
                return {billamount:ebillFinal,unitAdvance:unit,perUnit:perunitVal};

                
            }
            if(electric_status==='am'){
                value.currentUnit = previousUnit;
                return {billamount:eBill,unitAdvance:0,perUnit:0};
                
            }
       }

       let ebillData = ebillAmount();

        value.perunit= ebillData.perUnit;
        value.unitAdv = ebillData.unitAdvance;
        value.eBill = ebillData.billamount;
        

        
        let finalAmount = ebillData.billamount+(+rent)+(+dueAmount)+(+water_bill)+(+maintenance)+(+service);
        value.final_amt = finalAmount;
        value.paid_amt = 0;
        
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