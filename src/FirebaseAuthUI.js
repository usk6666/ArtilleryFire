import { Refresh } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, MenuItem, Select, Tab, TextField, Typography } from "@mui/material";
import { EmailAuthProvider, FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, OAuthProvider, TwitterAuthProvider, applyActionCode, createUserWithEmailAndPassword, getAuth, getIdTokenResult, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signOut, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { googlecode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { AUTHENTICATION_NAME, RESULT_ERROR, RESULT_SUCCESS } from "./Constants";
import { getCurrentDatetime } from "./Utils";

function FirebaseAuthUI({ addLog }) {

  const [provider, setProvider] = useState("password");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [idToken, setIdToken] = useState(null);
  const [currentTab, setCurrentTab] = useState("sign_in_out");

  const handleChange = (event, newValue) => {

    setCurrentTab(newValue);
  };

  function _addLog(result, operation, detail) {

    addLog(getCurrentDatetime(), AUTHENTICATION_NAME, result, operation, detail);
  }

  function reAuth() {

    const user = getAuth().currentUser;
    if (user) {
      if (user.providerId === "password") {
        const credential = EmailAuthProvider.credential(user.email, password);
        reauthenticateWithCredential(user, credential)
          .then(() => {
            console.log("re-authenticated.");
            return true;
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, "Re-authentication", `Failed to auto reauthenticate with following error.\n\n${String(e)}`);
            return false;
          })
      }
      return true;
    } else {
      return false;
    }
  }

  function signUp() {

    createUserWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        _addLog(RESULT_SUCCESS, "Sign Up (createUserWithEmailAndPassword)", `Successfully signed up.\n\n${JSON.stringify(userCredential, null, 4)}`);
      })
      .catch((e) => {
        _addLog(RESULT_ERROR, "Sign Up (createUserWithEmailAndPassword)", `Signup failed with the following error:\n\n${String(e)}`);
        console.log(e);
      })
  }

  function signInWithEmailPassword() {

    signInWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        if (userCredential !== null) {
          _addLog(RESULT_SUCCESS, "Sign In (signInWithEmailAndPassword)", `Successfully signed in.\n\n${JSON.stringify(userCredential, null, 4)}`);
        } else {
          _addLog(RESULT_ERROR, "Sign In (signInWithEmailAndPassword)", "Signin failed with unknown error.");
        }
      })
      .catch((e) => {
        _addLog(RESULT_ERROR, "Sign In (signInWithEmailAndPassword)", `Signin failed with the following error:\n\n${String(e)}`);
        console.log(e);
      })
  }

  function signInWithNNN(name) {

    let provider;
    switch (name) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "apple":
        provider = new OAuthProvider("apple.com");
        break;
      case "twitter":
        provider = new TwitterAuthProvider();
        break;
      case "github":
        provider = new GithubAuthProvider();
        break;
      case "microsoft":
        provider = new OAuthProvider("microsoft.com");
        break;
      case "yahoo":
        provider = new OAuthProvider("yahoo.com");
        break;
      default:
        provider = new GoogleAuthProvider();
    }
    signInWithPopup(getAuth(), provider)
      .then((result) => {
        _addLog(RESULT_SUCCESS, "Sign In (signInWithPopup)", `Successfully signed in.\n\n${JSON.stringify(result, null, 4)}`);
      })
      .catch((e) => {
        _addLog(RESULT_ERROR, "Sign In (signInWithPopup)", `Signin failed with the following error:\n\n${String(e)}`);
        console.log(e);
      });
  }

  function signInWithAnonymous() {

    signInAnonymously(getAuth())
      .then(() => {
        _addLog(RESULT_SUCCESS, "Sign In (signInAnonymously)", "Successfully signed in anonymously.");
      })
      .catch((e) => {
        _addLog(RESULT_ERROR, "Sign In (signInAnonymously)", `Signin failed with the following error:\n\n${String(e)}`);
        console.log(e);
      })
  }

  function signIn() {

    switch (provider) {
      case "password":
        signInWithEmailPassword();
        break;
      case "anonymous":
        signInWithAnonymous();
        break;
      case "google":
        signInWithNNN("google");
        break;
      case "facebook":
        signInWithNNN("facebook");
        break;
      case "apple":
        signInWithNNN("apple");
        break;
      case "twitter":
        signInWithNNN("twitter");
        break;
      case "github":
        signInWithNNN("github");
        break;
      case "microsoft":
        signInWithNNN("microsoft");
        break;
      case "yahoo":
        signInWithNNN("yahoo");
        break;
      default:
        return;
    }
  }

  function logOut() {

    const auth = getAuth();
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          _addLog(RESULT_SUCCESS, "Sign Out (signOut)", "Successfully signed out.");
        })
        .catch((e) => {
          _addLog(RESULT_ERROR, "Sign Out (signOut)", `Signin failed with the following error:\n\n${String(e)}`);
          console.log(e);
        })
    } else {
      alert("unauthenticated.")
    }
  }

  function sendPassResetMail() {

    if (!email) {
      alert("'Email' required.");
    } else {
      sendPasswordResetEmail(getAuth(), email)
        .then(() => {
          _addLog(RESULT_SUCCESS, "Send Password Reset Email (sendPasswordResetEmail)", `Password reset email sent successfully. (To: ${email})`);
        })
        .catch((e) => {
          _addLog(RESULT_ERROR, "Send Password Reset Email (sendPasswordResetEmail)", `Failed to send confirmation email with the following error:\n\n${String(e)}`);
          console.log(e);
        })
    }
  }

  function sendVerifyEmail() {

    const user = getAuth().currentUser;
    if (user) {
      sendEmailVerification(user)
        .then(() => {
          _addLog(RESULT_SUCCESS, "Send verification email (sendEmailVerification)", `Verification email sent successfully. (To: ${user.email})`);
        })
        .catch((e) => {
          _addLog(RESULT_ERROR, "Send verification email (sendEmailVerification)", `Failed to send confirmation email with the following error:\n\n${String(e)}`);
          console.log(e);
        });
    } else {
      alert("unauthenticated.");
    }
  }

  function submitVerifyCode() {

    applyActionCode(getAuth(), verifyCode)
      .then(() => {
        _addLog(RESULT_SUCCESS, "Verify action code (applyActionCode)", "Email verified successfully.");
      })
      .catch((e) => {
        _addLog(RESULT_ERROR, "Send verification email (sendEmailVerification)", `Failed to verify email with following error:\n\n${String(e)}`);
        console.log(e);
      });
  }

  function getUserToken() {

    const user = getAuth().currentUser;
    if (user) {
      getIdTokenResult(user)
        .then((result) => {
          setIdToken(result);
        })
        .catch((e) => {
          console.log(e);
          alert(e);
        })
    } else {
      alert("unauthenticated.");
    }
  }

  function changeEmail() {

    const user = getAuth().currentUser;
    const old = user.email;
    if (user) {
      if (reAuth()) {
        updateEmail(user, newEmail)
          .then(() => {
            _addLog(RESULT_SUCCESS, "Update Email (updateEmail)", `Email updated. (${old} => ${newEmail})`)
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, "Update Email (updateEmail)", `Failed to update email with following error:\n\n${String(e)}`);
            console.log(e);
          })
      }
    } else {
      alert("unauthenticated.");
    }
  }

  function changePassword() {

    const user = getAuth().currentUser;
    if (user) {
      if (reAuth()) {
        updatePassword(user, newPassword)
          .then(() => {
            _addLog(RESULT_SUCCESS, "Update Password (updatePassword)", `Password updated. (User: ${user.email})`)
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, "Update Password (updatePassword)", `Failed to update password with following error:\n\n${String(e)}`);
            console.log(e);
          })
      }
    } else {
      alert("unauthenticated.");
    }
  }

  function changeProfileData() {

    const user = getAuth().currentUser;
    if (user) {
      const profile = { displayName: newDisplayName, photoURL: newPhotoURL };
      updateProfile(user, profile)
        .then(() => {
          _addLog(RESULT_SUCCESS, "Update Profile (updateProfile)", `User profile updated\n\n.${JSON.stringify(profile, null, 4)}`)
        })
        .catch((e) => {
          _addLog(RESULT_ERROR, "Update Profile (updateProfile)", `Failed to update profile with following error:\n\n${String(e)}`);
          console.log(e);
        })
    } else {
      alert("unauthenticated.");
    }
  }

  function deleteAccount() {

    const user = getAuth().currentUser;
    if (user) {
      if (!window.confirm("Are you sure you want to delete your account?")) {
        return;
      }
      if (reAuth()) {
        user.delete()
          .then(() => {
            _addLog(RESULT_SUCCESS, "Delete Account (user.delete)", `Account deleted. (${user.email})`);
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, "Delete Account (user.delete)", `Failed to delete account with following error:\n\n${String(e)}`);
            console.log(e);
          })
      }
    } else {
      alert("unauthenticated.");
    }
  }

  return (
    <div>
      <Typography variant="h4">Firebase Authentication</Typography>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={currentTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange}>
              <Tab label="Sign In/Out" value="sign_in_out" />
              <Tab label="Sign Up" value="sign_up" />
              <Tab label="User Info" value="user_info" />
              <Tab label="Change User Info" value="change_user_info" />
            </TabList>
          </Box>
          <TabPanel value="sign_in_out">
            <Typography variant="h5">Auth Provider</Typography>
            <Select sx={{ mr: 1, mt: 1 }} autoWidth label="Provider" variant="standard" value={provider} onChange={(event) => { setProvider(event.target.value); }}>
              <MenuItem value="password">Email/Password</MenuItem>
              <MenuItem value="anonymous">Anonymous</MenuItem>
              <MenuItem value="google">Google</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="apple">Apple</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="github">Github</MenuItem>
              <MenuItem value="microsoft">Microsoft</MenuItem>
              <MenuItem value="yahoo">Yahoo</MenuItem>
            </Select>
            <Card sx={{ mt: 1, mb: 1 }}>
              <CardContent>
                {provider === "password" &&
                  <>
                    <TextField label="E-mail" variant="standard" sx={{ mr: 1, mt: 1, width: "50%" }} defaultValue={email} onChange={(event) => setEmail(event.target.value)} />
                    <TextField label="Password" variant="standard" sx={{ mr: 1, mt: 1, width: "50%" }} type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
                  </>
                }
              </CardContent>
              <CardActions>
                <Button variant="contained" color="info" sx={{ mr: 1, mt: 1 }} onClick={signIn}>Sign In</Button>
                <Button onClick={logOut} variant="contained" sx={{ mr: 1, mt: 1 }} color="info">Sign Out</Button>
                <Button disabled={provider !== "password"} onClick={sendPassResetMail} variant="contained" sx={{ mr: 1, mt: 1 }} color="info">Send Password Reset Email</Button>
              </CardActions>
            </Card>
          </TabPanel>
          <TabPanel value="sign_up">
            <Card sx={{ mt: 1, mb: 1 }}>
              <CardHeader title="Signup with Email/Password auth provider" />
              <CardContent>
                <TextField label="E-mail" variant="standard" sx={{ ml: 1, mt: 1, width: "50%" }} defaultValue={email} onChange={(event) => setEmail(event.target.value)} />
                <TextField label="Password" variant="standard" sx={{ ml: 1, mt: 1, width: "50%" }} type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
              </CardContent>
              <CardActions>
                <Button variant="contained" color="info" sx={{ mr: 1, mt: 1 }} onClick={signUp}>Sign Up</Button>
              </CardActions>
            </Card>
          </TabPanel>
          <TabPanel value="user_info">
            <Button sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }} onClick={getUserToken} variant="contained" color="info">
              <Refresh />
            </Button>
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="User Information" />
              <SyntaxHighlighter language="json" style={googlecode}>{getAuth().currentUser ? JSON.stringify(getAuth().currentUser, null, 4) : ""}</SyntaxHighlighter>
            </Card>
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="IdToken Information" />
              <SyntaxHighlighter language="json" style={googlecode}>{idToken ? JSON.stringify(idToken, null, 4) : ""}</SyntaxHighlighter>
            </Card>
          </TabPanel>
          <TabPanel value="change_user_info">
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="Update user profile" />
              <CardContent>
                <TextField label="displayName" sx={{ ml: 1, mt: 1, width: "50%" }} variant="standard" onChange={(event) => { setNewDisplayName(event.target.value) }} />
                <TextField label="photoURL" sx={{ ml: 1, mt: 1, width: "50%" }} variant="standard" onChange={(event) => setNewPhotoURL(event.target.value)} />
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 1 }} onClick={changeProfileData} variant="contained" color="info">Update</Button>
              </CardActions>
            </Card>
            <Divider />
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="Update email address" />
              <CardContent>
                <TextField sx={{ ml: 1, mt: 1, width: "50%" }} variant="standard" onChange={(event) => { setNewEmail(event.target.value) }} label="New Email address" />
                <TextField label="Current Password" variant="standard" sx={{ ml: 1, mt: 1, width: "50%" }} type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 1 }} onClick={changeEmail} variant="contained" color="info">Update</Button>
              </CardActions>
            </Card>
            <Divider />
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="Update password" />
              <CardContent>
                <TextField label="Current Password" variant="standard" sx={{ ml: 1, mt: 1, width: "50%" }} type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
                <TextField type="password" sx={{ ml: 1, mt: 1, width: "50%" }} variant="standard" onChange={(event) => { setNewPassword(event.target.value) }} label="New password" />
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 1 }} onClick={changePassword} variant="contained" color="info">Update</Button>
              </CardActions>
            </Card>
            <Divider />
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="Mail verification" />
              <CardContent>
                <TextField sx={{ ml: 1, mt: 1, width: "50%" }} variant="standard" onChange={(event) => { setVerifyCode(event.target.value); }} label="oobCode" />
              </CardContent>
              <Typography sx={{ ml: 2 }} variant="caption">* verification code is "oobCode" parameter value in verification url.</Typography>
              <CardActions>
                <Button sx={{ ml: 1 }} onClick={sendVerifyEmail} variant="contained" color="info">Send verification mail</Button>
                <Button sx={{ ml: 1 }} onClick={submitVerifyCode} variant="contained" color="info">Verify Code</Button>
              </CardActions>
            </Card>
            <Divider />
            <Card sx={{ ml: 1, mt: 1, mr: 1, mb: 1 }}>
              <CardHeader title="Delete account" />
              <CardContent>
                <TextField label="Password" variant="standard" sx={{ mr: 1, mt: 1, width: "50%" }} type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 1 }} onClick={deleteAccount} variant="contained" color="error">Delete</Button>
              </CardActions>
            </Card>
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  )
}

export default FirebaseAuthUI