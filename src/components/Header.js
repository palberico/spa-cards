import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, TextField, Button, Box } from "@mui/material";

function Header() {
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchId.trim()) {
      navigate(`/card/${searchId}`);
    }
  };

  const handleLogoClick = (event) => {
    if (event.type === "click") {
      navigate("/");
    } else if (event.type === "contextmenu") {
      event.preventDefault();
      navigate("/login");
    }
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo with left-click and right-click functionality */}
        <Typography
          variant="h4"
          fontWeight="bold"
          onClick={handleLogoClick}
          onContextMenu={handleLogoClick}
          sx={{ cursor: "pointer" }}
        >
          SPA
        </Typography>

        {/* Search Box */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            variant="outlined"
            placeholder="Enter Certificate Number"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: { xs: "110px", sm: "210px" },
            }}
          />
          <Button variant="contained" color="secondary" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
