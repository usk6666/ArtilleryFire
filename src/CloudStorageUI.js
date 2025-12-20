import { Article, Folder } from "@mui/icons-material";
import { Box, Button, Divider, FormControl, Link, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import { getApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, list, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { RESULT_ERROR, RESULT_SUCCESS, STORAGE_NAME } from "./Constants";
import { getCurrentDatetime } from "./Utils";

function CloudStorageUI({ addLog }) {

  const [bucketName, setBucketName] = useState(getApp().options.storageBucket);
  const [action, setAction] = useState(localStorage.getItem("artillery_storage_action") ? localStorage.getItem("artillery_storage_action") : "list");
  const [path, setPath] = useState(localStorage.getItem("artillery_storage_path") ? localStorage.getItem("artillery_storage_path") : "");
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(<></>);
  const [pageSize, setPageSize] = useState(localStorage.getItem("artillery_storage_pageSize") ? parseInt(localStorage.getItem("artillery_storage_pageSize")) : 100);
  const [pageToken, setPageToken] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  function _addLog(result, operation, detail) {

    addLog(getCurrentDatetime(), STORAGE_NAME, result, operation, detail);
  }

  function loadNextPage() {
    if (!pageToken || !path) {
      alert("No more pages to load or path not set.");
      return;
    }

    if (bucketName.length === 0) {
      alert("Please input target bucket.");
      return;
    }

    const storage = getStorage(getApp(), bucketName);
    const storageRef = ref(storage, path);
    const now = getCurrentDatetime();
    const op = `List Next Page (list): {"path": "${path}", "maxResults": ${pageSize}}`;

    const folders = [];
    const items = [];

    list(storageRef, { maxResults: pageSize, pageToken: pageToken })
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          const folder = folderRef.fullPath;
          folders.push({ folder });
        });
        res.items.forEach((itemRef) => {
          const item = itemRef.fullPath;
          items.push({ item });
        });
        
        // Update page token for next page
        if (res.nextPageToken) {
          setPageToken(res.nextPageToken);
          setHasNextPage(true);
        } else {
          setPageToken(null);
          setHasNextPage(false);
        }
        
        const logDetail = JSON.stringify({
          folders: folders.length,
          items: items.length,
          hasMore: !!res.nextPageToken
        }, null, 4);
        _addLog(RESULT_SUCCESS, op, logDetail);
        setOutput(
          <>
            <Typography variant="body2">{now} : {op}</Typography>
            <Typography>Listed at {getCurrentDatetime()} - {folders.length} folders, {items.length} items {res.nextPageToken ? '(more available)' : '(all items)'}</Typography>
            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {folders.map((row) => (
                <ListItem key={row.folder}>
                  <ListItemIcon>
                    <Folder />
                  </ListItemIcon>
                  <ListItemText primary={row.folder} />
                </ListItem>
              ))}
              {items.map((row) => (
                <ListItem key={row.item}>
                  <ListItemIcon>
                    <Article />
                  </ListItemIcon>
                  <ListItemText primary={row.item} />
                </ListItem>
              ))}
            </List>
          </>
        );
      }).catch((e) => {
        _addLog(RESULT_ERROR, op, String(e));
        setOutput(
          <>
            <Typography variant="body2">{now} : {op}</Typography>
            <Typography variant="body1">{String(e)}</Typography>
          </>
        )
        console.log(e);
      });
  }

  function executeAction() {

    if (bucketName.length === 0) {
      alert("Please input target bucket.");
      return;
    }

    if (path.length === 0) {
      alert("Please input target path.");
      return;
    };

    const storage = getStorage(getApp(), bucketName);
    const storageRef = ref(storage, path);
    const now = getCurrentDatetime();
    let op;

    switch (action) {

      case "list":

        const folders = [];
        const items = [];
        op = `List (list): {"path": "${path}", "maxResults": ${pageSize}}`;
        list(storageRef, { maxResults: pageSize })
          .then((res) => {
            res.prefixes.forEach((folderRef) => {
              const folder = folderRef.fullPath;
              folders.push({ folder });
            });
            res.items.forEach((itemRef) => {
              const item = itemRef.fullPath;
              items.push({ item });
            });
            
            // Set page token for next page
            if (res.nextPageToken) {
              setPageToken(res.nextPageToken);
              setHasNextPage(true);
            } else {
              setPageToken(null);
              setHasNextPage(false);
            }
            
            const logDetail = JSON.stringify({
              folders: folders.length,
              items: items.length,
              hasMore: !!res.nextPageToken
            }, null, 4);
            _addLog(RESULT_SUCCESS, op, logDetail);
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography>Listed at {getCurrentDatetime()} - {folders.length} folders, {items.length} items {res.nextPageToken ? '(more available)' : '(all items)'}</Typography>
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {folders.map((row) => (
                    <ListItem key={row.folder}>
                      <ListItemIcon>
                        <Folder />
                      </ListItemIcon>
                      <ListItemText primary={row.folder} />
                    </ListItem>
                  ))}
                  {items.map((row) => (
                    <ListItem key={row.item}>
                      <ListItemIcon>
                        <Article />
                      </ListItemIcon>
                      <ListItemText primary={row.item} />
                    </ListItem>
                  ))}
                </List>
              </>
            );
          }).catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{String(e)}</Typography>
              </>
            )
            console.log(e);
          });
        break;

      case "download":

        op = `Download (getDownloadURL): {"path": "${path}"}`;

        getDownloadURL(ref(storage, path))
          .then((url) => {
            _addLog(RESULT_SUCCESS, op, `Target file: ${path}\nDownload URL: ${url}`);
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">Target file: {path}</Typography>
                <Link href={url} underline="hover" rel="noreferrer" target="_blank">{url}</Link>
              </>
            )
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{String(e)}</Typography>
              </>
            )
            console.log(e);
          });
        break;

      case "upload":

        if (file === null) {
          alert("Please select input file.");
          return;
        }

        op = `Upload (uploadBytes): {"path": "${path}"}`;

        uploadBytes(storageRef, file)
          .then((snapshot) => {
            _addLog(RESULT_SUCCESS, op, JSON.stringify(snapshot, null, 4));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{path} uploaded.</Typography>
              </>
            )
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{String(e)}</Typography>
              </>
            )
            console.log(e);
          });
        break;

      case "delete":

        if (!window.confirm(`Do you really want to delete the "${path}"?`)) {
          return;
        }

        op = `Delete (deleteObject): {"path": "${path}"}`;
        deleteObject(storageRef)
          .then((res) => {
            _addLog(RESULT_SUCCESS, op, JSON.stringify(res, null, 4));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{path} deleted.</Typography>
              </>
            )
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            setOutput(
              <>
                <Typography variant="body2">{now} : {op}</Typography>
                <Typography variant="body1">{String(e)}</Typography>
              </>
            )
            console.log(e);
          })
        break;

      default:

        break;
    }
  }

  return (
    <div>
      <Typography variant="h4">Cloud Storage</Typography>
      <TextField sx={{ mt: 1, mb: 1 }} label="Bucket" variant="standard" defaultValue={bucketName} fullWidth onChange={(event) => setBucketName(event.target.value)} />
      <FormControl>
        <Select sx={{ mb: 1, mr: 1 }} autoWidth label="Action" value={action} onChange={(event) => { localStorage.setItem("artillery_storage_action", event.target.value); setAction(event.target.value); }}>
          <MenuItem value="list">List (listAll)</MenuItem>
          <MenuItem value="download">Download (getDownloadURL)</MenuItem>
          <MenuItem value="upload">Upload (uploadBytes)</MenuItem>
          <MenuItem value="delete">Delete (deleteObject)</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Path" variant="standard" defaultValue={path} fullWidth sx={{ mb: 1 }} onChange={(event) => { localStorage.setItem("artillery_storage_path", event.target.value); setPath(event.target.value); }} />
      {action === "list" && (
        <TextField 
          sx={{ mb: 1 }} 
          type="number"
          label="Page Size (max items per query)" 
          value={pageSize}
          onChange={(event) => { 
            const newSize = parseInt(event.target.value) || 100;
            localStorage.setItem("artillery_storage_pageSize", String(newSize)); 
            setPageSize(newSize);
          }} 
        />
      )}
      {action === "upload" &&
        <TextField label="file" variant="standard" type="file" fullWidth sx={{ mb: 1 }} onChange={(event) => setFile(event.target.files[0])} />
      }
      <Button sx={{ mb: 1 }} onClick={executeAction} variant="contained">Execute</Button>
      {action === "list" && hasNextPage && (
        <Button sx={{ mb: 1, ml: 1 }} variant="outlined" onClick={loadNextPage}>
          Load Next Page
        </Button>
      )}
      <Divider />
      <Box sx={{ ml: 1, mr: 1, mt: 1, mb: 1 }}>
        {output}
      </Box>
    </div>
  )
}

export default CloudStorageUI;