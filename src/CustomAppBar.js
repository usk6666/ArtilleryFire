import { AccountCircle, Delete, LocalFireDepartment } from "@mui/icons-material";
import { AppBar, Button, FormControl, MenuItem, Select, Toolbar, Tooltip, Typography } from "@mui/material";
import FirebaseConfigUI from "./FirebaseConfigUI";

function CustomAppBar({ initApp, selectPage, user, addLog }) {

  function clearStorage() {
    if (window.confirm("Is it okay to delete the data in LocalStorage ?")) {
      localStorage.clear();
    }
  }

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <LocalFireDepartment sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Artillery Fire</Typography>
          <AccountCircle sx={{ mr: 1 }} />
          {(user)
            ? <Typography variant="subtitle1" sx={{ mr: 2 }}>{user.email ? user.email : "(authenticated)"}</Typography>
            : <Typography sx={{ mr: 2 }}>(unauthenticated)</Typography>
          }
          <FormControl sx={{ mr: 1, mt: 1, mb: 1, minWidth: 120 }}>
            <Select style={{ color: "#ffffff" }} variant="standard" label="Product" defaultValue="top" onChange={(event) => { selectPage(event.target.value); }}>
              <MenuItem value="top">(Select Product)</MenuItem>
              <MenuItem value="authentication">Authentication</MenuItem>
              <MenuItem value="firestore">Cloud Firestore</MenuItem>
              <MenuItem value="storage">Cloud Storage</MenuItem>
            </Select>
          </FormControl>
          <FirebaseConfigUI initApp={initApp} addLog={addLog} />
          <Tooltip title="Delete all localStorage data.">
            <Button variant="contained" color="warning" sx={{ mr: 1 }} onClick={clearStorage}><Delete /></Button>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default CustomAppBar