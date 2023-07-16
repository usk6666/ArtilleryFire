import { Alert, Box, Snackbar } from "@mui/material";
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { useState } from "react";
import CloudFirestoreUI from "./CloudFirestoreUI";
import CloudStorageUI from "./CloudStorageUI";
import { LOG_ITEM_NAME, RESULT_ERROR, RESULT_SUCCESS } from "./Constants";
import CustomAppBar from "./CustomAppBar";
import FirebaseAuthUI from "./FirebaseAuthUI";
import LogUI from "./LogUI";
import TopPage from "./TopPage";
import { getLogs } from "./Utils";

function App() {

  const [page, setPage] = useState("top");
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [message, setMessage] = useState("");

  function initApp(firebaseConfig) {

    const _app = initializeApp(firebaseConfig);
    const _auth = getAuth(_app);

    setPersistence(_auth, browserLocalPersistence)
      .then(() => {
        console.log("persistence is set to browserLocalPersistence.")
      })
    _auth.onAuthStateChanged((user) => {
      setUser(user);
    })
  }

  function selectPage(page) {

    setPage(page);
  }

  function addLog(datetime, product, result, operation, detail) {

    let logs = getLogs();
    const id = logs.length + 1;
    const log = { id, datetime, product, result, operation, detail };
    logs = [log, ...logs];
    localStorage.setItem(LOG_ITEM_NAME, JSON.stringify(logs));
    setCount(count + 1);
    if (result === RESULT_SUCCESS) {
      setSeverity("success");
    } else if (result === RESULT_ERROR) {
      setSeverity("error");
    }
    setMessage(operation);
    setOpen(true);
  }

  return (
    <div className="App">
      <Box>
        <CustomAppBar initApp={initApp} selectPage={selectPage} user={user} addLog={addLog} />
        <Box sx={{ mt: 2, mr: 2, ml: 2 }}>
          {(page === "top") && <TopPage />}
          {(page === "authentication") && <FirebaseAuthUI addLog={addLog} />}
          {(page === "firestore") && <CloudFirestoreUI addLog={addLog} />}
          {(page === "storage") && <CloudStorageUI addLog={addLog} />}
        </Box>
        <Snackbar open={open} autoHideDuration={5000} onClose={() => { setOpen(!open); }}>
          <Alert onClose={() => { setOpen(!open); }} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
        <LogUI />
      </Box>
    </div>
  );
}

export default App;
