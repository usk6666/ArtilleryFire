import { Article, Delete, FileUpload, KeyboardArrowDown, Save } from "@mui/icons-material";
import { Box, Button, Dialog, Divider, Drawer, Fab, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { googlecode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { LOG_ITEM_NAME } from "./Constants";
import { getLogs, initLogs } from "./Utils";

function LogUI() {

  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [operation, setOperation] = useState("");
  const [datetime, setDatetime] = useState("");
  const [result, setResult] = useState("");
  const [detail, setDetail] = useState("");

  const handleRowClick = (params) => {
    setOperation(params.row.operation);
    setDatetime(params.row.datetime);
    setResult(params.row.result);
    setDetail(params.row.detail);
    setOpenDialog(true);
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "datetime",
      headerName: "Datetime",
      width: 170,
      editable: false,
    },
    {
      field: "product",
      headerName: "Product",
      width: 100,
      editable: false,
    },
    {
      field: "result",
      headerName: "Result",
      width: 100,
      editable: false,
    },
    {
      field: "operation",
      headerName: "Operation",
      width: 250,
      editable: false,
    },
    {
      field: "detail",
      headerName: "Detail",
      sortable: false,
      width: 480,
      editable: false,
    },
  ];

  const rows = getLogs();

  function _clearLogs() {
    if (!window.confirm("Are you sure you want to clear your history?")) {
      return;
    }
    localStorage.removeItem(LOG_ITEM_NAME);
    initLogs();
    handleOpen(); // for update view
  }

  function _saveActionLog() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("logs"));
    const elm = document.createElement("a");
    elm.setAttribute("href", dataStr);
    elm.setAttribute("download", "artillery-fire-logs.json");
    elm.click();
    elm.remove();
  }

  function _importActionLog() {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      console.log(event);
      localStorage.setItem(LOG_ITEM_NAME, event.target.result);
    });
    const elm = document.createElement("input");
    elm.setAttribute("type", "file");
    elm.setAttribute("accept", "application/json");
    elm.addEventListener("change", (event) => {
      const files = event.target.files;
      if (window.confirm("Loading the file clears the current history. do you want to continue?")) {
        reader.readAsText(files[0]);
      }
    });
    elm.click();
    elm.remove();
    handleOpen();
  }

  return (
    <>
      <Fab sx={{ position: "fixed", bottom: 16, right: 16 }} onClick={handleOpen} color="primary">
        <Tooltip title="Open action history">
          <Article />
        </Tooltip>
      </Fab>
      <Drawer anchor="bottom" open={open} onClose={handleOpen}>
        <Button onClick={handleOpen} color="inherit">
          <KeyboardArrowDown />
        </Button>
        <Typography variant="h5" sx={{ textAlign: "center" }}>Action history</Typography>
        <Box sx={{ mt: 1, mb: 1, ml: 1, mr: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
          />
          <Dialog open={openDialog} onClose={() => { setOpenDialog(!openDialog); }}>
            <Typography variant="h6" sx={{ ml: 1, mr: 1, mt: 1 }}>{`${result} : ${operation}`}</Typography>
            <Typography variant="caption" sx={{ ml: 1, mr: 1 }}>{datetime}</Typography>
            <Divider />
            <SyntaxHighlighter language="json" style={googlecode}>{detail}</SyntaxHighlighter>
          </Dialog>
        </Box>
        <Tooltip title="Save action history">
          <Button onClick={_saveActionLog}>
            <Save />
          </Button>
        </Tooltip>
        <Tooltip title="Load action history">
          <Button onClick={_importActionLog}>
            <FileUpload />
          </Button>
        </Tooltip>
        <Tooltip title="Clear action history">
          <Button onClick={_clearLogs} color="inherit">
            <Delete />
          </Button>
        </Tooltip>
      </Drawer>
    </>
  )
}

export default LogUI