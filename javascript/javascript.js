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
  setDoc,
  getDoc,
  query,
  serverTimestamp,
  orderBy,
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
const auth = getAuth(app);
const userList = [];
const loginbtn = document.getElementById("login-btn");
const logindiv = document.getElementById("login-div");
const logoutbtn = document.getElementById("logout-btn");
const userinterface = document.getElementById("user-interface");
const userprofilepicture = document.getElementById("user-profile-picture");
const mainbodyleft = document.getElementById("main-body-left");
const sideprofile = document.getElementsByClassName("side-profiles");
const profiles = document.getElementById("profiles");
const currentclickeduser = document.getElementById("current-clicked-user");
const currentclickedtext = document.getElementById("current-clicked-text");
const userinput = document.getElementById("user-input");
const maincotainer = document.getElementById("main-container")
const mainbodyright = document.getElementById("main-body-right")
const db = getFirestore();
const messagedb = collection(db, "Messages");
const userdb = collection(db, "userDetails");
let selecteduser;

function signin() {
  const popup = new GoogleAuthProvider(app);
  signInWithPopup(auth, popup);
}
function signout() {
  signOut(auth);
}
function setdata(user) {
  logindiv.classList.add("blank");
  logindiv.classList.remove("login-div");
  userinterface.classList.remove("blank");
  userinterface.classList.add("user-interface");
  userprofilepicture.src = user.photoURL;
}

async function sendMessage(seconduser, message, realuser) {
  const sndmsg = await addDoc(messagedb, {
    reciveruid: seconduser,
    message: message.value,
    time: serverTimestamp(),
    senderuid: realuser.uid,
  });
}

function loadMessage(data){

 const filterdata = data.filter((ndata)=>{
    return ndata.reciveruid===selecteduser
  })
 filterdata.forEach((nndata)=>{
  if(nndata.reciveruid!=selecteduser){
    return
  }
  else{
    console.log(nndata.message)
  }
 })
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    setdata(user);
    onSnapshot(query(messagedb, orderBy("time")), (data) => {
      loadMessage(data.docs.map((msg) => msg.data()));
    });
    const userinfo = async () => {
      const newid = await setDoc(doc(db, "userDetails", auth.currentUser.uid), {
        uid: user.uid,
        profilepic: user.photoURL,
        username: user.displayName,
      });
      const newprofile = await getDocs(userdb);
      const container = [];
      newprofile.forEach((newdata) => {
        const updatedata = newdata.data();
        if (updatedata.uid == user.uid) {
          return;
        } else {
          const link = document.createElement("a");
          link.href = "#";
          link.classList.add("button-inner");
          const sidelayout = document.createElement("button");
          sidelayout.classList.add("side-profiles");
          sidelayout.value = updatedata.uid;

          const sidelayoutimage = document.createElement("img");
          sidelayoutimage.classList.add("side-profiles-img");
          sidelayoutimage.src = updatedata.profilepic;
          const sidelayouttext = document.createElement("div");
          sidelayouttext.classList.add("side-profiles-text");
          sidelayouttext.textContent = updatedata.username;
          link.append(sidelayoutimage, sidelayouttext);
          sidelayout.appendChild(link);
          container.push(sidelayout);

          sidelayout.addEventListener("click", async() => {
            getDoc(doc(db, "userDetails", sidelayout.value)).then((doc) => {
               const details = doc.data();
               maincotainer.classList.remove("main-container-adjust");
               mainbodyright.classList.remove("blank");
               currentclickeduser.src = details.profilepic;
               currentclickedtext.textContent = details.username;
               selecteduser = sidelayout.value;
               document.querySelectorAll(".side-profiles").forEach((profile)=>{
                profile.classList.remove("active")
               })
               sidelayout.classList.add("active")

            });
            getDocs(messagedb).then((datas)=>{
              loadMessage(datas.docs.map((msg) => msg.data()));
            })
            
          });
          

        }
        profiles.replaceChildren(...container);
      });
    };

    userinfo();
   userinput.addEventListener("keypress", (e) => {
     if (e.key === "Enter") {
       sendMessage(selecteduser, userinput, user);
     }
   });
    logoutbtn.addEventListener("click", () => {
      signout();
      logindiv.classList.add("login-div");
      logindiv.classList.remove("blank");
      userinterface.classList.remove("user-interface");
      userinterface.classList.add("blank");
    });
  } else {
    loginbtn.addEventListener("click", () => {
      signin();

      //  auth.currentUser.uid
    });
  }
});
