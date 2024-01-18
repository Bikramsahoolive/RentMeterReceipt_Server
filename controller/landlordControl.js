const firebase = require('../model/database');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const express = require('express');
const app = express();


async function createUserData(req, res) {

    let data = req.body;
    // PASSWORD HASHING

    function encPassword(pass) {
        let hash = bcrypt.hashSync(pass, 10);
        return hash;
    }
    data.password = encPassword(data.password);

    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "landlord"));

    const ids = [];
    const emails = [];
    const phones = [];

    querySnapshot.forEach((doc) => {
        ids.push(doc.data().id);
        emails.push(doc.data().email);
        phones.push(doc.data().phone);
    });

    // GENERATE DYNAMIC ID 
    function generateId() {

        let ritid = Math.round(Math.random(100000, 999999) * 1000000);// or Date.now();

        finalSubmit(ritid);
    }
    // CHECK IF ID ALREADY INSERTED
    function checkId(idn) {

        return ids.includes(idn);
    }

    let num = Math.round(Math.random(100000, 999999) * 1000000);

    // FINAL SUBMITION DATA
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
    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send("user already exist");
    } else {
        finalSubmit(num);
    }

}





async function getAllUsers(req, res) {


    // GET ALL DATA

    const querySnapshot = await getDocs(collection(db, "landlord"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);


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
        res.send("No such document!");
    }


}



function deleteUserData(req, res) {

    //DELETE DATA

    deleteDoc(doc(db, "landlord", req.params.id))
        .then(() => res.send(`Deleted successfully`))
        .catch((err) => res.send(err))

}


async function loginLandlord(req, res) {
    let data = req.body;

    //GET FILTERED DATA
    const q = query(collection(db, "landlord"), where("phone", "==", (data.phone)));
    const querySnapshot = await getDocs(q);
    let user;
    querySnapshot.forEach((doc) => {
        user = doc.data();
    });
    if (user) {

        req.session.key = user;

        res.send(user);

    } else { res.send("No User found!") }

}

function landlordCheckLogin(req, res) {
    let data = req.session.key;
    data.isActive = true;
    res.send(data);
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

module.exports = {
    createUserData,
    getAllUsers,
    updateUserData,
    getSingleUser,
    deleteUserData,
    loginLandlord,
    landlordCheckLogin,
    landlordLogout
};