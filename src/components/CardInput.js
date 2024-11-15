import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Button, Typography, Card, CardContent, Snackbar, Box, Grid, CircularProgress } from "@mui/material";
import AdminHeader from "./AdminHeader";
import QrCodeLabelModal from "./QrCodeLabelModal";

function CardInput() {
  const [formData, setFormData] = useState({
    year: "",
    brand: "",
    sport: "",
    card_number: "",
    player: "",
    grade: "",
    grade_description: "",
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [cardDocRef, setCardDocRef] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDropFront = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFrontImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
  }, []);

  const onDropBack = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setBackImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
  }, []);

  // Initialize dropzone without unused props
  useDropzone({ onDrop: onDropFront, accept: "image/*" });
  useDropzone({ onDrop: onDropBack, accept: "image/*" });

  const uploadImage = async (imageFile, path) => {
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, imageFile);
    return await getDownloadURL(imageRef);
  };

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const newCardDocRef = await addDoc(collection(db, "cards"), formData);
      const frontImageUrl = await uploadImage(frontImage, `cards/${newCardDocRef.id}_front`);
      const backImageUrl = await uploadImage(backImage, `cards/${newCardDocRef.id}_back`);

      await updateDoc(doc(db, "cards", newCardDocRef.id), {
        imageFront: frontImageUrl,
        imageBack: backImageUrl,
      });

      const baseUrl = "https://spagrading.com";
      const cardUrl = `${baseUrl}/card/${newCardDocRef.id}`;
      setQrCodeUrl(cardUrl);
      setCardDocRef(newCardDocRef);
      setOpenModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplete = () => {
    setOpenSnackbar(true); // Show snackbar notification
    setOpenModal(false); // Close the modal
    setFormData({
      year: "",
      brand: "",
      sport: "",
      card_number: "",
      player: "",
      grade: "",
      grade_description: "",
    });
    setFrontImage(null);
    setBackImage(null);
    setQrCodeUrl("");
  };

  return (
    <div>
      <AdminHeader />
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
        <Card sx={{ maxWidth: 700, width: "100%", padding: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Add New Card
            </Typography>

            <Grid container spacing={2}>
              {["year", "brand", "sport", "card_number", "player", "grade"].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    label={field.replace("_", " ").toUpperCase()}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <TextField
                  label="GRADE DESCRIPTION"
                  name="grade_description"
                  value={formData.grade_description}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => setFormData({})}>Reset Form</Button>
              <Button variant="contained" color="primary" onClick={generateQRCode} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Generate QR Code"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <QrCodeLabelModal
        open={openModal}
        onClose={handleSaveComplete} // Use handleSaveComplete to close the modal and reset the form
        formData={formData}
        qrCodeUrl={qrCodeUrl}
        cardDocRef={cardDocRef}
        onSaveComplete={handleSaveComplete} // Pass the onSaveComplete handler
      />

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message="Card saved successfully!" />
    </div>
  );
}

export default CardInput;
