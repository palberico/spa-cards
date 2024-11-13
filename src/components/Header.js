import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, TextField, Button, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
    <AppBar position="fixed" sx={{ width: "100%" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "space-between" },
          flexWrap: { xs: "wrap", sm: "nowrap" },
          paddingY: 1,
        }}
      >
        {/* Logo with left-click and right-click functionality */}
        <Box
          onClick={handleLogoClick}
          onContextMenu={handleLogoClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/SPA Logo.svg`} // Link to the logo in the public folder
            alt="SPA Logo"
            style={{
              height: "40px", // Adjust height as needed
              width: "auto",
            }}
          />
        </Box>

        {/* Search Box */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            justifyContent: "center",
            width: "100%",
            maxWidth: 400, // Limit the width to avoid overflow
            mt: { xs: 1, sm: 0 },
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Enter Certificate Number"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: { xs: "80%", sm: "210px" },
              maxWidth: 300, // Ensure TextField doesn’t exceed the container width
            }}
          />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button variant="contained" color="secondary" onClick={handleSearch}>
              Search
            </Button>
          </Box>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton
              color="secondary"
              onClick={handleSearch}
              sx={{
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px", // Add padding for circular shape
                boxShadow: 1,
                color: "primary.main", // Change icon color
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Slight hover effect
                },
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
