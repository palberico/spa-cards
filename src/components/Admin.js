import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Typography, Grid } from "@mui/material";
import AdminHeader from "./AdminHeader";

function Admin() {
  const navigate = useNavigate();

  const goToCardInput = () => {
    navigate("/cardinput");
  };

  const goToCardEdit = () => {
    navigate("/cardedit");
  };

  return (
    <div>
      <AdminHeader />
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "80vh" }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item>
            <Card sx={{ maxWidth: 400, padding: 3, textAlign: "center" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Admin Dashboard
                </Typography>
                <Button variant="contained" color="primary" onClick={goToCardInput}>
                  Enter New Card
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card sx={{ maxWidth: 400, padding: 3, textAlign: "center" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Edit or Delete Card
                </Typography>
                <Button variant="contained" color="secondary" onClick={goToCardEdit}>
                  Edit Card
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default Admin;
