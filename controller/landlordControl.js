const firebase = require('../model/database');
// const {getDatabase, onValue, ref, set, update, remove, child, get, orderByChild, query} = require('firebase/database');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
// const db = getDatabase();
const db = getFirestore();




async function createUserData(req, res) {

    let data = req.body;

    const querySnapshot = await getDocs(collection(db, "landlord"));

    const details = [];

    querySnapshot.forEach((doc) => {
        details.push(doc.data().id);
    });

    // DATA INSERT
    function generateId() {

        let ritid = Math.round(Math.random(100000, 999999) * 1000000);// or Date.now();

        finalSubmit(ritid);
    }

    function checkId(idn) {

        return details.includes(idn);
    }

    let num = Math.round(Math.random(100000, 999999) * 1000000);

    function finalSubmit(rid) {

        if (checkId(rid)) {
            generateId();

        } else {

            data.id = rid;

            let dataRef = doc(db, "landlord", JSON.stringify(rid));

            try {

                setDoc(dataRef, data);
                res.send(`Data inserted successfully with id : ${rid}.`);

            } catch (error) {
                res.send(error);
            }

        }
    }

    finalSubmit(num);
}





async function getAllUsers(req, res) {

    //----------------------------CLOUD STORE-----------------------------------------------

    // GET ALL DATA

        const querySnapshot = await getDocs(collection(db, "landlord"));
        const details = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            details.push(doc.data());
        });
        res.send(details);


    //--------------------------REALTIME DATABASE-------------------------------------
    //GET ALL DATA REALTIME.
    // try {

    //     const data = ref(db,"landlord");

    //   onValue (data,(snapshot) => {
    //             const details=[];
    //         snapshot.forEach(childSnapshot => {

    //             details.push(childSnapshot.val());

    //         });
    //         res.send(details);
    //   });

    //   } catch (error) {
    //     res.send(error);

    //   }
}




function updateUserData(req, res) {

    // UPDATE DATA

    let data = req.body;

    const dataRef = doc(db, "landlord", req.params.id);

    try {
          updateDoc(dataRef, data);
        res.send(`Data updated Successfully with id ${req.params.id}`);
    } catch (error) {
        res.send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA
    const docSnap = await getDoc(doc(db, "landlord", req.params.id));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        // docSnap.data() will be undefined in this case
        res.send("No such document!");
    }



    //-------------------------------------REALTIME DATABASE-----------------------------------

    //GET SINGLE DATA REALTIME.
    // try {

    //     // const data = ;

    //   onValue (ref(db,`landlord/${JSON.stringify(req.params.id)}`),(snapshot) => {

    //              res.send(snapshot);
    //         });


    //   } catch (error) {
    //     res.send(error);

    //   }
}
 function deleteUserData(req, res) {

    //DELETE DATA

         deleteDoc(doc(db, "landlord", req.params.id))
         .then(()=>res.send(`Deleted successfully`))
         .catch((err)=>res.send(err))
        
    
        
    
}





async function loginLandlord(req, res) {
    let data = req.body;

    //GET FILTERED DATA
    const q = query(collection(db, "landlord"), where("phone", "==", (data.phone)));
    const querySnapshot = await getDocs(q);
    let user;
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        user = doc.data();
    });
    if (user) {
        res.send(user);
    } else { res.send("No User found!") }

}

module.exports = {
    createUserData,
    getAllUsers,
    updateUserData,
    getSingleUser,
    deleteUserData,
    loginLandlord
};