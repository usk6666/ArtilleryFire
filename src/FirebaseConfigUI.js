import { Button, Dialog, DialogTitle, TextField } from '@mui/material';
import { useState } from "react";
import { GENERIC_NAME, RESULT_ERROR, RESULT_SUCCESS } from './Constants';
import { getCurrentDatetime } from './Utils';

function FirebaseConfigUI({ initApp, addLog }) {

  let firebaseConfig;
  if (localStorage.getItem("firebaseConfig") === null) {
    firebaseConfig = {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: ""
    };
  } else {
    firebaseConfig = JSON.parse(localStorage.getItem("firebaseConfig"));
  }

  const [open, setOpen] = useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey);
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain);
  const [projectId, setProjectId] = useState(firebaseConfig.projectId);
  const [storageBucket, setStorageBucket] = useState(firebaseConfig.storageBucket);
  const [initialized, setInitialized] = useState(false);

  function init() {
    if (!apiKey || !authDomain || !projectId) {
      alert("'apiKey', 'authDomain', 'projectId' are required.");
      return;
    }
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: authDomain,
      projectId: projectId,
      storageBucket: storageBucket
    };
    try {
      initApp(firebaseConfig);
      localStorage.setItem("firebaseConfig", JSON.stringify(firebaseConfig));
      setInitialized(true);
      addLog(getCurrentDatetime(), GENERIC_NAME, RESULT_SUCCESS, "Initialize", `Firebase client initialized successfuly with following options:\n\n${JSON.stringify(firebaseConfig, null, 4)}`);
      handleClose();
    } catch (e) {
      console.log(e);
      addLog(getCurrentDatetime(), GENERIC_NAME, RESULT_ERROR, "Initialize", `Failed to initialize Firebase client with following error:\n\n${String(e)}`);
    }
  };

  return (
    <div>
      <Button sx={{ flexGrow: 1, mr: 1 }} variant="outlined" color="inherit" onClick={handleOpen}>{(!initialized) ? "Initialize Config" : projectId}</Button>
      <Dialog open={open} onClose={handleClose} fullWidth={true}>
        <DialogTitle>Firebase Config</DialogTitle>
        <TextField sx={{ ml: 1, mr: 1, mt: 1 }} label="apiKey" required variant="standard" disabled={initialized} defaultValue={apiKey} onChange={(event) => { if (!initialized) { setApiKey(event.target.value) } }} />
        <TextField sx={{ ml: 1, mr: 1, mt: 1 }} label="authDomain" required variant="standard" disabled={initialized} defaultValue={authDomain} onChange={(event) => { if (!initialized) { setAuthDomain(event.target.value) } }} />
        <TextField sx={{ ml: 1, mr: 1, mt: 1 }} label="projectId" required variant="standard" disabled={initialized} defaultValue={projectId} onChange={(event) => { if (!initialized) { setProjectId(event.target.value) } }} />
        <TextField sx={{ ml: 1, mr: 1, mt: 1 }} label="storageBucket" variant="standard" disabled={initialized} defaultValue={storageBucket} onChange={(event) => { if (!initialized) { setStorageBucket(event.target.value) } }} />
        <Button onClick={init} disabled={initialized} >Initialize</Button>
        <Button onClick={handleClose}>Close</Button>
      </Dialog>
    </div>
  );
}

export default FirebaseConfigUI