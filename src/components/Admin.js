import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Pagination,
} from "@mui/material";
import { db, storage } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import AdminHeader from "./AdminHeader";
import DeleteIcon from "@mui/icons-material/Delete";

function Admin() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const cardSnapshot = await getDocs(cardsCollection);
      setCards(cardSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchCards();
  }, []);

  const goToCardInput = () => {
    navigate("/cardinput");
  };

  const goToCardEdit = () => {
    navigate("/cardedit");
  };

  const handleDeleteClick = (id) => {
    setCardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const cardRef = doc(db, "cards", cardToDelete);
    const frontRef = ref(storage, `cards/${cardToDelete}_front`);
    const backRef = ref(storage, `cards/${cardToDelete}_back`);
    const qrCodeRef = ref(storage, `qr_codes/${cardToDelete}_qrCode.png`);

    await deleteDoc(cardRef);
    await Promise.all([
      deleteObject(frontRef).catch(() => {}),
      deleteObject(backRef).catch(() => {}),
      deleteObject(qrCodeRef).catch(() => {}),
    ]);

    setCards((prevCards) => prevCards.filter((card) => card.id !== cardToDelete));
    setSnackbarMessage("Card and associated data deleted successfully.");
    setOpenSnackbar(true);
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const paginatedCards = cards.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div>
      <AdminHeader />
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item>
            <Card sx={{ maxWidth: 400, padding: 3, textAlign: "center" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Create New Card
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

        {/* Table for Card List */}
        <TableContainer component={Paper} sx={{ mt: 4, width: "90%" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell> {/* Front Image Column */}
                <TableCell>Cert #</TableCell>
                <TableCell>Sport</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Player</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    {card.imageFront ? (
                      <img
                        src={card.imageFront}
                        alt="Front of Card"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No Image
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link to={`/card/${card.id}`} style={{ textDecoration: "none", color: "blue" }}>
                      {card.id}
                    </Link>
                  </TableCell>
                  <TableCell>{card.sport}</TableCell>
                  <TableCell>{card.year}</TableCell>
                  <TableCell>{card.brand}</TableCell>
                  <TableCell>{card.player}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteClick(card.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2} mb={2}>
            <Pagination
              count={Math.ceil(cards.length / rowsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>
        </TableContainer>
      </Box>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this card and all associated data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
}

export default Admin;
