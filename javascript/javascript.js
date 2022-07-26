import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js";
import {
  collection,
  getFirestore,
  addDoc,
  onSnapshot,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyA2E1phuV0Lu-Ee053u3n0enfNu-m65_w0",
  authDomain: "chatapp-420ec.firebaseapp.com",
  projectId: "chatapp-420ec",
  storageBucket: "chatapp-420ec.appspot.com",
  messagingSenderId: "1050120810877",
  appId: "1:1050120810877:web:858ceffebca22e6a325c14",
  measurementId: "G-NHJ03W4WM6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
 const userList = [];
const loginbtn = document.getElementById("login-btn");
const logindiv = document.getElementById("login-div");
const logoutbtn = document.getElementById("logout-btn")
const userinterface = document.getElementById("user-interface");
const userprofilepicture = document.getElementById("user-profile-picture");
const mainbodyleft = document.getElementById("main-body-left");
const sideprofile = document.getElementById("side-profiles")

const db= getFirestore();
const messagedb=collection(db,"Messages");
const userdb=collection(db,"userDetails");


function signin(){
    const popup=new GoogleAuthProvider(app);
    signInWithPopup(auth,popup);
  
    

}
function signout(){
    signOut(auth);
}
function setdata(user){
  logindiv.classList.add("blank");
  logindiv.classList.remove("login-div");
  userinterface.classList.remove("blank");
  userinterface.classList.add("user-interface");
  userprofilepicture.src = user.photoURL;

    
  
}
// function listOfUser(user){
//  userList.push(user.uid)
// }
function sideProfileDesign(data){
 const sidelayout = document.createElement("button")
 sidelayout.classList.add("side-profiles")
 sidelayout.value = data.uid;
 const sidelayoutimage = document.createElement("img")
 sidelayoutimage.classList.add("side-profiles-img")
 sidelayoutimage.src = data.profilepic
 const sidelayouttext = document.createElement("div")
 sidelayouttext.classList.add("side-profiles-text")
 sidelayouttext.textContent = data.username;
 sidelayout.append(sidelayoutimage,sidelayouttext)
 mainbodyleft.appendChild(sidelayout)

}



onAuthStateChanged(auth,(user)=>{
    if(user){
    setdata(user)
    const userinfo = async () => {
      const newid = await setDoc(doc(db, "userDetails", auth.currentUser.uid), {
        uid: user.uid,
        profilepic: user.photoURL,
        username: user.displayName,
      });
    const newprofile = await getDocs(userdb)
    newprofile.forEach((newdata)=>{
      const updatedata = newdata.data()
      sideProfileDesign(updatedata)
        })
    };
    userinfo()
    
  
    logoutbtn.addEventListener('click',()=>{
        signout();
         logindiv.classList.add("login-div");
         logindiv.classList.remove("blank");
         userinterface.classList.remove("user-interface");
         userinterface.classList.add("blank");
    })

    
    }
    else{

     

     loginbtn.addEventListener("click", () => {
       signin();
       
       //  auth.currentUser.uid
       
     });
    
    }
})

