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
const maincotainer = document.getElementById("main-container");
const mainbodyright = document.getElementById("main-body-right");
const messagecontainer = document.getElementById("message-container");
const exitbtn = document.getElementById("exit-btn");
const messagesendbtn = document.getElementById("message-send-btn");

// const msgidiv = document.getElementsByClassName("message-inside-div")
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

function loadMessage(data) {
  const msglist = [];
  const filterdata = data.filter((ndata) => {
    return (
      (ndata.senderuid === auth.currentUser.uid &&
        ndata.reciveruid === selecteduser) ||
      (ndata.senderuid === selecteduser &&
        ndata.reciveruid === auth.currentUser.uid)
    );
  });
  console.log(filterdata);
  filterdata.forEach((nndata) => {
    const messageinsidediv = document.createElement("div");
    messageinsidediv.classList.add("message-div-inside");
    const messageinsideinsidediv = document.createElement("div");
    messageinsideinsidediv.classList.add("message-inside-inside-div");
    const messagediv = document.createElement("div");
    messagediv.classList.add("message");
    messagediv.textContent = nndata.message;
    const messageprofile = document.createElement("img");
    messageprofile.classList.add("message-profile");
    messageprofile.src = nndata.photoprofile;

    if (nndata.senderuid == auth.currentUser.uid) {
      messageinsideinsidediv.style.justifyContent = "right";
      messageinsideinsidediv.append(messagediv, messageprofile);
    } else {
      messageinsideinsidediv.style.justifyContent = "left";
      messageinsideinsidediv.append(messageprofile, messagediv);
    }
    messageinsidediv.append(messageinsideinsidediv);
    msglist.push(messageinsidediv);
  });
  const scrolldiv = document.createElement("div");
  msglist.push(scrolldiv);
  messagecontainer.replaceChildren(...msglist);
  scrolldiv.scrollIntoView();
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

          sidelayout.addEventListener("click", () => {
            selecteduser = sidelayout.value;
            getDoc(doc(db, "userDetails", sidelayout.value)).then((doc) => {
              const details = doc.data();
              maincotainer.classList.remove("main-container-adjust");
              mainbodyright.classList.remove("blank");
              // mainbodyright.classList.add("main-body-right");
              mainbodyleft.classList.add("new-blank");
              currentclickeduser.src = details.profilepic;
              currentclickedtext.textContent = details.username;

              document.querySelectorAll(".side-profiles").forEach((profile) => {
                profile.classList.remove("active");
              });
              sidelayout.classList.add("active");
            });
            exitbtn.addEventListener("click", () => {
              mainbodyright.classList.add("blank");
              mainbodyleft.classList.remove("new-blank");
              maincotainer.classList.add("main-container-adjust");
            });
            getDocs(query(messagedb, orderBy("time"))).then((datas) => {
              loadMessage(datas.docs.map((msg) => msg.data()));
            });
          });
        }
        profiles.replaceChildren(...container);
      });
    };

    userinfo();
    userinput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (userinput.value.trim()) {
          addDoc(messagedb, {
            reciveruid: selecteduser,
            message: userinput.value,
            time: serverTimestamp(),
            senderuid: user.uid,
            photoprofile: user.photoURL,
          });
        }
        userinput.value = "";
      }
    });
    messagesendbtn.addEventListener("click", () => {
      if (userinput.value.trim()) {
        addDoc(messagedb, {
          reciveruid: selecteduser,
          message: userinput.value,
          time: serverTimestamp(),
          senderuid: user.uid,
          photoprofile: user.photoURL,
        });
      }
      userinput.value = "";
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
