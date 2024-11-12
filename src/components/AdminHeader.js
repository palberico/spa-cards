// /src/components/AdminHeader.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/");
    }).catch(error => {
      console.error("Logout failed:", error);
    });
  };

  const handleLogoClick = () => {
    navigate("/admin");
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          onClick={handleLogoClick}
          sx={{ cursor: "pointer" }}
        >
          SPA
        </Typography>
        <Box>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AdminHeader;
