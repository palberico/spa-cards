import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch(error => {
        console.error("Logout failed:", error);
      });
  };

  const handleLogoClick = () => {
    navigate("/admin");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "white", boxShadow: "none" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          onClick={handleLogoClick}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/SPA Logo.svg`}
            alt="SPA Logo"
            style={{
              height: "40px", // Adjust height as needed
              width: "auto",
              marginRight: "10px",
            }}
          />
        </Box>
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
