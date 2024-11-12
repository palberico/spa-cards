import React, { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject, getDownloadURL, uploadBytes } from "firebase/storage";
import { TextField, Button, Typography, Box, Card, CardContent, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useDropzone } from "react-dropzone";
import AdminHeader from "./AdminHeader";

function CardEdit() {
  const [searchId, setSearchId] = useState("");
  const [cardData, setCardData] = useState(null);
  const [imageFront, setImageFront] = useState(null);
  const [imageBack, setImageBack] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchId.trim()) {
      const cardRef = doc(db, "cards", searchId);
      const cardSnap = await getDoc(cardRef);
      if (cardSnap.exists()) {
        setCardData(cardSnap.data());
        setImageFront(cardSnap.data().imageFront);
        setImageBack(cardSnap.data().imageBack);
      } else {
        setCardData(null);
        setSnackbarMessage("Card not found.");
        setOpenSnackbar(true);
      }
    }
  };

  const handleUpdate = async () => {
    if (cardData) {
      setConfirmDialogOpen(true);
    }
  };

  const confirmUpdate = async () => {
    const cardRef = doc(db, "cards", searchId);

    // Upload new images if changed
    const updatedData = { ...cardData };
    if (imageFront instanceof File) {
      const frontRef = ref(storage, `cards/${searchId}_front`);
      await uploadBytes(frontRef, imageFront);
      updatedData.imageFront = await getDownloadURL(frontRef);
    }
    if (imageBack instanceof File) {
      const backRef = ref(storage, `cards/${searchId}_back`);
      await uploadBytes(backRef, imageBack);
      updatedData.imageBack = await getDownloadURL(backRef);
    }

    // Update card data in Firestore
    await updateDoc(cardRef, updatedData);
    setSnackbarMessage("Card updated successfully.");
    setOpenSnackbar(true);
    setConfirmDialogOpen(false);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const cardRef = doc(db, "cards", searchId);
    const frontRef = ref(storage, `cards/${searchId}_front`);
    const backRef = ref(storage, `cards/${searchId}_back`);
    const qrCodeRef = ref(storage, `qr_codes/${searchId}_qrCode.png`);

    // Delete Firestore document
    await deleteDoc(cardRef);

    // Delete associated images and QR code from Storage
    await Promise.all([
      deleteObject(frontRef).catch(() => {}),
      deleteObject(backRef).catch(() => {}),
      deleteObject(qrCodeRef).catch(() => {}),
    ]);

    setSnackbarMessage("Card and associated data deleted successfully.");
    setOpenSnackbar(true);
    setDeleteDialogOpen(false);
    setCardData(null);
    setSearchId("");
  };

  const handleImageChange = (file, type) => {
    if (type === "front") setImageFront(file);
    else if (type === "back") setImageBack(file);
  };

  const onDropFront = useCallback((acceptedFiles) => {
    handleImageChange(acceptedFiles[0], "front");
  }, []);

  const onDropBack = useCallback((acceptedFiles) => {
    handleImageChange(acceptedFiles[0], "back");
  }, []);

  const { getRootProps: getRootPropsFront, getInputProps: getInputPropsFront } = useDropzone({ onDrop: onDropFront, accept: 'image/*' });
  const { getRootProps: getRootPropsBack, getInputProps: getInputPropsBack } = useDropzone({ onDrop: onDropBack, accept: 'image/*' });

  return (
    <div>
      <AdminHeader />
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "80vh", flexDirection: "column" }}>
        <Card sx={{ maxWidth: 600, padding: 3, overflow: "auto", maxHeight: "70vh" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Edit or Delete Card</Typography>
            <TextField
              label="Enter Card Document ID"
              variant="outlined"
              fullWidth
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            {!cardData && (
              <Button variant="contained" color="primary" onClick={handleSearch}>
                Search
              </Button>
            )}

            {cardData && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>Edit Card Details</Typography>
                <TextField
                  label="Label Type"
                  name="label_type"
                  value={cardData.label_type || ""}
                  onChange={(e) => setCardData({ ...cardData, label_type: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Year"
                  name="year"
                  value={cardData.year || ""}
                  onChange={(e) => setCardData({ ...cardData, year: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Brand"
                  name="brand"
                  value={cardData.brand || ""}
                  onChange={(e) => setCardData({ ...cardData, brand: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Player"
                  name="player"
                  value={cardData.player || ""}
                  onChange={(e) => setCardData({ ...cardData, player: e.target.value })}
                  fullWidth
                  margin="normal"
                />

                <Box mt={3}>
                  <Typography>Front Image:</Typography>
                  <Box {...getRootPropsFront()} sx={{ border: "1px dashed #ccc", padding: 2, textAlign: "center" }}>
                    <input {...getInputPropsFront()} />
                    {typeof imageFront === "string" ? (
                      <img src={imageFront} alt="Front" style={{ width: "100%", maxHeight: 200 }} />
                    ) : (
                      <p>Drag 'n' drop to replace front image, or click to select</p>
                    )}
                  </Box>

                  <Typography mt={2}>Back Image:</Typography>
                  <Box {...getRootPropsBack()} sx={{ border: "1px dashed #ccc", padding: 2, textAlign: "center" }}>
                    <input {...getInputPropsBack()} />
                    {typeof imageBack === "string" ? (
                      <img src={imageBack} alt="Back" style={{ width: "100%", maxHeight: 200 }} />
                    ) : (
                      <p>Drag 'n' drop to replace back image, or click to select</p>
                    )}
                  </Box>
                </Box>

                <Button variant="contained" color="secondary" onClick={handleUpdate} sx={{ mt: 3 }}>
                  Update Card
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 3, ml: 2 }}>
                  Delete Card
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />

      {/* Confirmation Dialog for Update */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to update this card?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpdate} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this card and all associated data?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CardEdit;
