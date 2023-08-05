import { Divider, Typography } from "@mui/material";

function TopPage() {
  return (
    <div>
      <Typography variant="h3">Artillery Fire</Typography>
      <Typography variant="subtitle1">Firebase client tools for security assessment or penetration testing.</Typography>
      <Divider />
      <Typography variant="subtitle1">You can also work with firebase library in browser console.</Typography>
      <Typography variant="caption">"firebase/app" =&gt; global.firebaseApp</Typography><br />
      <Typography variant="caption">"firebase/auth" =&gt; global.firebaseAuth</Typography><br />
      <Typography variant="caption">"firebase/firestore" =&gt; global.cloudFirestore</Typography><br />
      <Typography variant="caption">"firebase/storage" =&gt; global.cloudStorage</Typography><br />
      <Typography variant="caption">"firebase/functions" =&gt; global.cloudFunctions</Typography>
    </div>
  );
}

export default TopPage;