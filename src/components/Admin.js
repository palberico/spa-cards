import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
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
  Checkbox,
  Tooltip,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { db, storage } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import AdminHeader from "./AdminHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MassPrintModal from "./MassPrintModal";

function Admin() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
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

  const goToCardEdit = (id) => {
    navigate(`/cardedit/${id}`);
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
    const labelRef = ref(storage, `labels/${cardToDelete}_label.png`);

    await deleteDoc(cardRef);
    await Promise.all([
      deleteObject(frontRef).catch(() => {}),
      deleteObject(backRef).catch(() => {}),
      deleteObject(qrCodeRef).catch(() => {}),
      deleteObject(labelRef).catch(() => {}),
    ]);

    setCards((prevCards) => prevCards.filter((card) => card.id !== cardToDelete));
    setSnackbarMessage("Card and associated data deleted successfully.");
    setOpenSnackbar(true);
    setDeleteDialogOpen(false);
  };

  const handleCheckboxChange = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const handlePrintLabels = () => {
    if (selectedCards.length > 0) {
      setOpenPrintModal(true);
    } else {
      setSnackbarMessage("No labels selected for printing.");
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const filteredCards = cards.filter((card) =>
    Object.values(card).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(search.toLowerCase())
    )
  );

  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div>
      <AdminHeader />
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 4 }}>
        
        <Box sx={{ width: "90%", mb: 3 }}>
          <TextField
            label="Search by any field (e.g., player, certificate number)"
            variant="outlined"
            fullWidth
            value={search}
            onChange={handleSearchChange}
          />
        </Box>

        <TableContainer component={Paper} sx={{ width: "90%" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Certificate Number</TableCell>
                <TableCell>Sport</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="center">
                  <Tooltip title="Add New Card" arrow>
                    <IconButton onClick={goToCardInput}>
                      <AddCircleIcon color="primary" fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCards.includes(card.id)}
                      onChange={() => handleCheckboxChange(card.id)}
                    />
                  </TableCell>
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
                    <IconButton onClick={() => goToCardEdit(card.id)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(card.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
  <Button variant="contained" onClick={handlePrintLabels} sx={{ ml: 2 }}> {/* Add margin-left */}
    Print Labels
  </Button>
  <Box display="flex" justifyContent="right" flexGrow={1}> {/* Center the pagination */}
    <Pagination
      count={Math.ceil(filteredCards.length / rowsPerPage)}
      page={currentPage}
      onChange={handlePageChange}
    />
  </Box>

</Box>
        </TableContainer>
      </Box>

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

      {openPrintModal && (
        <MassPrintModal
          open={openPrintModal}
          onClose={() => setOpenPrintModal(false)}
          selectedCards={selectedCards}
        />
      )}

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
