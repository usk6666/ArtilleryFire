import { TextareaAutosize } from "@mui/base";
import { Box, Button, Checkbox, FormControl, FormControlLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { documentId, addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { googlecode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FIRESTORE_NAME, RESULT_ERROR, RESULT_SUCCESS } from "./Constants";
import { getCurrentDatetime } from "./Utils";

function CloudFirestoreUI({ addLog }) {

  const [action, setAction] = useState(localStorage.getItem("artillery_firestore_action") ? localStorage.getItem("artillery_firestore_action") : "get");
  const [enableFilter, setEnableFilter] = useState(localStorage.getItem("artillery_firestore_enableFilter") ? Boolean(localStorage.getItem("artillery_firestore_enableFilter")) : false);
  const [condition, setCondition] = useState(localStorage.getItem("artillery_firestore_condition") ? localStorage.getItem("artillery_firestore_condition") : "==");
  const [type, setType] = useState(localStorage.getItem("artillery_firestore_type") ? localStorage.getItem("artillery_firestore_type") : "string");
  const [path, setPath] = useState(localStorage.getItem("artillery_firestore_path") ? localStorage.getItem("artillery_firestore_path") : "");
  const [docId, setDocId] = useState(localStorage.getItem("artillery_firestore_docId") ? localStorage.getItem("artillery_firestore_docId") : "");
  const [inputData, setInputData] = useState(localStorage.getItem("artillery_firestore_inputData") ? localStorage.getItem("artillery_firestore_inputData") : "");
  const [outputData, setOutputData] = useState(localStorage.getItem("artillery_firestore_outputData") ? localStorage.getItem("artillery_firestore_outputData") : "");
  const [field, setField] = useState(localStorage.getItem("artillery_firestore_field") ? localStorage.getItem("artillery_firestore_field") : "");
  const [value, setValue] = useState(localStorage.getItem("artillery_firestore_value") ? localStorage.getItem("artillery_firestore_value") : "");

  function storeOutputData(data) {

    localStorage.setItem("artillery_firestore_outputData", String(data));
    setOutputData(String(data));
  }

  function _addLog(result, operation, detail) {
    if (result === RESULT_SUCCESS) {
      addLog(getCurrentDatetime(), FIRESTORE_NAME, result, operation, detail);
      storeOutputData(detail);
    } else if (result === RESULT_ERROR) {
      addLog(getCurrentDatetime(), FIRESTORE_NAME, result, operation, detail);
      storeOutputData(detail);
    }
  }

  function insecure_eval() {

    let _data;
    try {
      eval(`let jsonInput = [${inputData}]; jsonInput = jsonInput[0]; _data = jsonInput;`); // eslint-disable-line no-eval
    } catch (e) {
      alert("Please enter a valid JSON object.");
    }
    return _data;
  }


  function executeQuery() {

    const firestore = getFirestore();
    let op;

    switch (action) {
      case "get":
        if (!docId || !path) {
          alert("'Get' operation is require 'Collection name / Path' and 'Document ID'.");
          return;
        }
        const docRef = doc(firestore, path, docId);
        op = `Get (getDoc): {"path": "${path}", "docId": "${docId}"}`;
        getDoc(docRef)
          .then((snapshot) => {
            const document_id = snapshot.id;
            const data = snapshot.data();
            if (!data) {
              _addLog(RESULT_ERROR, op, `Document ID: ${docId} not found.`)
            } else {
              const dd = { document_id, data }
              _addLog(RESULT_SUCCESS, op, JSON.stringify(dd, null, 4));
            }
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            console.log(e);
          });
        break;
      case "list":
        if (!path) {
          alert("'List' operation is require 'Collection name / Path'.");
          return;
        }
        let q;
        if (enableFilter) {
          op = `List (getDocs): {"path": "${path}", "field": "${field}", "condition": "${condition}", "value": "${value}"}`;
          let v;
          switch (type) {
            case "string":
              v = String(value);
              break;
            case "number":
              v = Number(value);
              break;
            case "boolean":
              v = Boolean(value);
              break;
            default:
              v = String(value);
          }
          if (condition === "in" || condition === "not-in") {
            v = [v];
          }
          if (field === "documentId()") {
            q = query(collection(firestore, path), where(documentId(), condition, v));
          } else {
            q = query(collection(firestore, path), where(field, condition, v));
          }
        } else {
          op = `List (getDocs): {"path": "${path}"}`;
          q = query(collection(firestore, path));
        }
        getDocs(q)
          .then((snapshot) => {
            let d = [];
            snapshot.forEach((doc) => {
              const document_id = doc.id;
              const data = doc.data();
              const dd = { document_id, data }
              d.push(dd);
            })
            _addLog(RESULT_SUCCESS, op, JSON.stringify(d, null, 4));
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            console.log(e);
          });
        break;
      case "create":
        if (!path) {
          alert("'Create' operation is require 'Collection name / Path'.");
          return;
        }
        op = `Create (addDoc): {"path": "${path}"}`;
        addDoc(collection(firestore, path), insecure_eval())
          .then((docRef) => {
            _addLog(RESULT_SUCCESS, op, JSON.stringify(docRef, null, 4));
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            console.log(e);
          });
        break;
      case "update":
        if (!docId || !path) {
          alert("'Create/Update' operation is require 'Collection name / Path' and 'Document ID'.");
          return;
        }
        op = `Create/Update (setDoc): {"path": "${path}", "docId": "${docId}"}`;
        setDoc(doc(firestore, path, docId), insecure_eval())
          .then(() => {
            _addLog(RESULT_SUCCESS, op, `Successfully updated:\n${JSON.stringify({"path": path, "docId": docId}, null, 4)}`);
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            console.log(e);
          });
        break;
      case "delete":
        if (!docId || !path) {
          alert("'Delete' operation is require 'Collection name / Path' and 'Document ID'.");
          return;
        }
        op = `Delete (deleteDoc): {"path": "${path}", "docId": "${docId}"}`;
        deleteDoc(doc(firestore, path, docId))
          .then(() => {
            _addLog(RESULT_SUCCESS, op, `Successfully deleted:\n${JSON.stringify({"path": path, "docId": docId}, null, 4)}`);
          })
          .catch((e) => {
            _addLog(RESULT_ERROR, op, String(e));
            console.log(e);
          });
        break;
      default:
        return;
    }
  }

  return (
    <div>
      <Typography variant="h4">Cloud Firestore</Typography>
      <FormControl>
        <Select sx={{ mt: 1, mb: 1, mr: 1 }} autoWidth label="Action" value={action} onChange={(event) => { localStorage.setItem("artillery_firestore_action", event.target.value); setAction(event.target.value); }}>
          <MenuItem value="get">Get(getDoc)</MenuItem>
          <MenuItem value="list">List(getDocs)</MenuItem>
          <MenuItem value="create">Create(addDoc) *document id will set random auto-id</MenuItem>
          <MenuItem value="update">Create/Update(setDoc)</MenuItem>
          <MenuItem value="delete">Delete(deleteDoc)</MenuItem>
        </Select>
      </FormControl>
      <Button sx={{ mt: 1 }} variant="contained" onClick={executeQuery}>Execute</Button>
      <TextField sx={{ mb: 1 }} defaultValue={path} fullWidth label="Collection name / Path" onChange={(event) => { localStorage.setItem("artillery_firestore_path", event.target.value); setPath(event.target.value) }} />
      {!(action in { create: "create", list: "list" }) && <TextField sx={{ mb: 1, mr: 1 }} label="Document ID" defaultValue={docId} onChange={(event) => { localStorage.setItem("artillery_firestore_docId", event.target.value); setDocId(event.target.value) }} />}
      {action === "list" &&
        <div>
          <FormControlLabel control={<><FormControl><Checkbox value={enableFilter} onChange={(event) => { localStorage.setItem("artillery_firestore_enableFilter", String(event.target.checked)); setEnableFilter(event.target.checked) }} /></FormControl></>} label="Enable Filter" />
          <Tooltip title="If you want to specify by DocumentID, please specify 'documentId()'">
            <TextField sx={{ mr: 1 }} label="Field" defaultValue={field} onChange={(event) => { localStorage.setItem("artillery_firestore_field", event.target.value); setField(event.target.value) }} />
          </Tooltip>
          <FormControl>
            <Select sx={{ mr: 1 }} label="condition" value={condition} onChange={(event) => { localStorage.setItem("artillery_firestore_condition", event.target.value); setCondition(event.target.value); }}>
              <MenuItem value="==">==</MenuItem>
              <MenuItem value="!=">!=</MenuItem>
              <MenuItem value=">">&gt;</MenuItem>
              <MenuItem value=">=">&gt;=</MenuItem>
              <MenuItem value="<">&lt;</MenuItem>
              <MenuItem value="<=">&lt;=</MenuItem>
              <MenuItem value="in">in</MenuItem>
              <MenuItem value="not-in">not-in</MenuItem>
              <MenuItem value="array-contains">array-contains</MenuItem>
              <MenuItem value="not-array-contains">not-array-contains</MenuItem>
            </Select>
          </FormControl>
          <TextField sx={{ mr: 1 }} label="Value" defaultValue={value} onChange={(event) => { localStorage.setItem("artillery_firestore_value", event.target.value); setValue(event.target.value) }} />
          <FormControl>
            <Select sx={{ mr: 1 }} label="Value type" value={type} onChange={(event) => { localStorage.setItem("artillery_firestore_type", event.target.value); setType(event.target.value) }} >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
            </Select>
          </FormControl>
        </div>
      }
      <br />
      {(action in { create: "create", update: "update" }) &&
        <TextareaAutosize style={{ width: "100%", outlineColor: "#aaaaaa" }} minRows={5} defaultValue={inputData} placeholder="Input Data. Example: {'string_field': 'value', 'timestamp_field': new Date() }" onChange={(event) => { localStorage.setItem("artillery_firestore_inputData", event.target.value); setInputData(event.target.value) }}></TextareaAutosize>
      }
      <Box sx={{ mt: 1 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Output</Typography>
        <SyntaxHighlighter language="json" style={googlecode}>{outputData}</SyntaxHighlighter>
      </Box>
    </div>
  )
}

export default CloudFirestoreUI;