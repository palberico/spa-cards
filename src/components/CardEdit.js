import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject, getDownloadURL, uploadBytes } from "firebase/storage";
import { TextField, Button, Typography, Box, Card, CardContent, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useDropzone } from "react-dropzone";
import AdminHeader from "./AdminHeader";

function CardEdit() {
  const { id: cardId } = useParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState(null);
  const [imageFront, setImageFront] = useState(null);
  const [imageBack, setImageBack] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      if (cardId) {
        const cardRef = doc(db, "cards", cardId);
        const cardSnap = await getDoc(cardRef);
        if (cardSnap.exists()) {
          setCardData(cardSnap.data());
          setImageFront(cardSnap.data().imageFront);
          setImageBack(cardSnap.data().imageBack);
        } else {
          setSnackbarMessage("Card not found.");
          setOpenSnackbar(true);
          navigate("/admin");
        }
      }
    };
    fetchCardData();
  }, [cardId, navigate]);

  const handleUpdate = async () => {
    if (cardData) {
      setConfirmDialogOpen(true);
    }
  };

  const confirmUpdate = async () => {
    const cardRef = doc(db, "cards", cardId);
    const updatedData = { ...cardData };

    if (imageFront instanceof File) {
      const frontRef = ref(storage, `cards/${cardId}_front`);
      await uploadBytes(frontRef, imageFront);
      updatedData.imageFront = await getDownloadURL(frontRef);
    }
    if (imageBack instanceof File) {
      const backRef = ref(storage, `cards/${cardId}_back`);
      await uploadBytes(backRef, imageBack);
      updatedData.imageBack = await getDownloadURL(backRef);
    }

    await updateDoc(cardRef, updatedData);
    setSnackbarMessage("Card updated successfully.");
    setOpenSnackbar(true);
    setConfirmDialogOpen(false);
    navigate("/admin"); // Redirect to Admin after update
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const cardRef = doc(db, "cards", cardId);
    const frontRef = ref(storage, `cards/${cardId}_front`);
    const backRef = ref(storage, `cards/${cardId}_back`);
    const qrCodeRef = ref(storage, `qr_codes/${cardId}_qrCode.png`);

    await deleteDoc(cardRef);
    await Promise.all([
      deleteObject(frontRef).catch(() => {}),
      deleteObject(backRef).catch(() => {}),
      deleteObject(qrCodeRef).catch(() => {}),
    ]);

    setSnackbarMessage("Card and associated data deleted successfully.");
    setOpenSnackbar(true);
    setDeleteDialogOpen(false);
    navigate("/admin"); // Redirect to Admin after delete
  };

  const handleCancel = () => {
    navigate("/admin"); // Navigate back to Admin screen on cancel
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
        <Card sx={{ maxWidth: 1000, padding: 4, overflow: "auto", maxHeight: "70vh" }}>
          <CardContent>
    
            {cardData && (
              <Box>
                <Typography variant="h6" gutterBottom>Edit Card Details</Typography>
                
                {/* Editable fields */}
                <TextField label="Label Type" name="label_type" value={cardData.label_type || ""} onChange={(e) => setCardData({ ...cardData, label_type: e.target.value })} fullWidth margin="normal" />
                <TextField label="Year" name="year" value={cardData.year || ""} onChange={(e) => setCardData({ ...cardData, year: e.target.value })} fullWidth margin="normal" />
                <TextField label="Brand" name="brand" value={cardData.brand || ""} onChange={(e) => setCardData({ ...cardData, brand: e.target.value })} fullWidth margin="normal" />
                <TextField label="Player" name="player" value={cardData.player || ""} onChange={(e) => setCardData({ ...cardData, player: e.target.value })} fullWidth margin="normal" />
                <TextField label="Sport" name="sport" value={cardData.sport || ""} onChange={(e) => setCardData({ ...cardData, sport: e.target.value })} fullWidth margin="normal" />
                <TextField label="Card Number" name="card_number" value={cardData.card_number || ""} onChange={(e) => setCardData({ ...cardData, card_number: e.target.value })} fullWidth margin="normal" />
                <TextField label="Grade" name="grade" value={cardData.grade || ""} onChange={(e) => setCardData({ ...cardData, grade: e.target.value })} fullWidth margin="normal" />
                <TextField label="Grade Description" name="grade_description" value={cardData.grade_description || ""} onChange={(e) => setCardData({ ...cardData, grade_description: e.target.value })} fullWidth margin="normal" />

                {/* Image Uploads */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Box width="48%">
                    <Typography>Front Image:</Typography>
                    <Box {...getRootPropsFront()} sx={{ border: "1px dashed #ccc", padding: 1, textAlign: "center" }}>
                      <input {...getInputPropsFront()} />
                      {typeof imageFront === "string" ? (
                        <img src={imageFront} alt="Front" style={{ width: "100%", maxHeight: 100, objectFit: "cover" }} />
                      ) : (
                        <p>Drag 'n' drop to replace front image, or click to select</p>
                      )}
                    </Box>
                  </Box>

                  <Box width="48%">
                    <Typography>Back Image:</Typography>
                    <Box {...getRootPropsBack()} sx={{ border: "1px dashed #ccc", padding: 1, textAlign: "center" }}>
                      <input {...getInputPropsBack()} />
                      {typeof imageBack === "string" ? (
                        <img src={imageBack} alt="Back" style={{ width: "100%", maxHeight: 100, objectFit: "cover" }} />
                      ) : (
                        <p>Drag 'n' drop to replace back image, or click to select</p>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Box>
                    <Button variant="contained" color="secondary" onClick={handleUpdate}>
                      Update Card
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{ ml: 2 }}>
                      Delete Card
                    </Button>
                  </Box>
                  <Button variant="outlined" color="primary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />

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
