import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Button, Typography, Card, CardContent, Snackbar, Box, Grid, CircularProgress } from "@mui/material";
import AdminHeader from "./AdminHeader";
import QrCodeLabelModal from "./QrCodeLabelModal"; // Import new component
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [loading, setLoading] = useState(false); // Loading state
  const qrCodeRef = useRef(null);

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

  const { getRootProps: getRootPropsFront, getInputProps: getInputPropsFront } = useDropzone({ onDrop: onDropFront, accept: 'image/*' });
  const { getRootProps: getRootPropsBack, getInputProps: getInputPropsBack } = useDropzone({ onDrop: onDropBack, accept: 'image/*' });

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

  const saveQRCodeImage = async () => {
    if (!cardDocRef || !qrCodeRef.current) return;
    const canvas = qrCodeRef.current.querySelector("canvas");
    if (!canvas) {
      console.error("QR code canvas not found");
      return;
    }

    canvas.toBlob(async (blob) => {
      try {
        const qrCodeRefStorage = ref(storage, `qr_codes/${cardDocRef.id}_qrCode.png`);
        await uploadBytes(qrCodeRefStorage, blob);
        const qrCodeImageUrl = await getDownloadURL(qrCodeRefStorage);
        await updateDoc(cardDocRef, { qr_code: qrCodeImageUrl });
        setOpenSnackbar(true);
        handleModalClose();
      } catch (error) {
        console.error("Error saving QR code image:", error);
      }
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    resetForm();
  };

  const printLabel = async () => {
    const labelElement = qrCodeRef.current;
    const canvas = await html2canvas(labelElement);
    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [67, 20.5],
    });
    pdf.addImage(imageData, "PNG", 0, 0, 67, 20.5);
    pdf.save(`Card_Label_${formData.card_number}.pdf`);
  };

  const resetForm = () => {
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

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <AdminHeader />
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
        <Card sx={{ maxWidth: 700, width: '100%', padding: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Add New Card</Typography>

            <Grid container spacing={2}>
              {['year', 'brand', 'sport', 'card_number', 'player', 'grade'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField 
                    label={field.replace('_', ' ').toUpperCase()} 
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

              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>Front Image</Typography>
                <Box {...getRootPropsFront()} sx={{ border: '2px dashed #aaa', padding: 2, textAlign: 'center' }}>
                  <input {...getInputPropsFront()} />
                  {frontImage ? (
                    <img src={frontImage.preview} alt="Front Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                  ) : (
                    <Typography>Drag & drop front image here, or click to select</Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>Back Image</Typography>
                <Box {...getRootPropsBack()} sx={{ border: '2px dashed #aaa', padding: 2, textAlign: 'center' }}>
                  <input {...getInputPropsBack()} />
                  {backImage ? (
                    <img src={backImage.preview} alt="Back Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                  ) : (
                    <Typography>Drag & drop back image here, or click to select</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="outlined" color="secondary" onClick={resetForm}>Reset Form</Button>
              <Button variant="contained" color="primary" onClick={generateQRCode} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Generate QR Code"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* QR Code Modal */}
      <QrCodeLabelModal
        open={openModal}
        onClose={handleModalClose}
        formData={formData}
        qrCodeUrl={qrCodeUrl}
        cardDocRef={cardDocRef}
        saveQRCodeImage={saveQRCodeImage}
        printLabel={printLabel}
      />

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose} message="Card saved successfully!" />
    </div>
  );
}

export default CardInput;
