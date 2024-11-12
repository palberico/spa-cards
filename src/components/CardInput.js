import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Button, Typography, Card, CardContent, Snackbar, Modal, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AdminHeader from "./AdminHeader";

function CardInput() {
  const [formData, setFormData] = useState({
    label_type: "",
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
  const qrCodeRef = useRef(null);
  const labelRef = useRef(null);

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
    }
  };

  const saveQRCodeImage = async () => {
    if (!cardDocRef) return;

    const canvas = qrCodeRef.current.querySelector("canvas");
    canvas.toBlob(async (blob) => {
      try {
        const qrCodeRef = ref(storage, `qr_codes/${cardDocRef.id}_qrCode.png`);
        await uploadBytes(qrCodeRef, blob);
        const qrCodeImageUrl = await getDownloadURL(qrCodeRef);

        await updateDoc(cardDocRef, { qr_code: qrCodeImageUrl });

        setOpenSnackbar(true);
        setOpenModal(false);
        resetForm();
      } catch (error) {
        console.error("Error saving QR code image:", error);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      label_type: "",
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

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const printLabel = async () => {
    const labelElement = labelRef.current;
    const canvas = await html2canvas(labelElement);
    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imageData, "PNG", 10, 10, 90, 120); // Adjust as necessary
    pdf.save(`Card_Label_${formData.card_number}.pdf`);
  };

  return (
    <div>
      <AdminHeader />
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
        <Card sx={{ maxWidth: 600, width: '100%', overflow: "auto", maxHeight: "80vh", padding: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Admin - Add New Card</Typography>
            
            <TextField label="Label Type" name="label_type" value={formData.label_type} onChange={handleInputChange} fullWidth />
            <TextField label="Year" name="year" value={formData.year} onChange={handleInputChange} fullWidth />
            <TextField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} fullWidth />
            <TextField label="Sport" name="sport" value={formData.sport} onChange={handleInputChange} fullWidth />
            <TextField label="Card Number" name="card_number" value={formData.card_number} onChange={handleInputChange} fullWidth />
            <TextField label="Player" name="player" value={formData.player} onChange={handleInputChange} fullWidth />
            <TextField label="Grade" name="grade" value={formData.grade} onChange={handleInputChange} fullWidth />
            <TextField label="Grade Description" name="grade_description" value={formData.grade_description} onChange={handleInputChange} fullWidth />

            <Box {...getRootPropsFront()} sx={{ border: '2px dashed #aaa', padding: 2, textAlign: 'center', margin: '20px 0' }}>
              <input {...getInputPropsFront()} />
              {frontImage ? (
                <img src={frontImage.preview} alt="Front Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
              ) : (
                <p>Drag 'n' drop front image here, or click to select</p>
              )}
            </Box>

            <Box {...getRootPropsBack()} sx={{ border: '2px dashed #aaa', padding: 2, textAlign: 'center', margin: '20px 0' }}>
              <input {...getInputPropsBack()} />
              {backImage ? (
                <img src={backImage.preview} alt="Back Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
              ) : (
                <p>Drag 'n' drop back image here, or click to select</p>
              )}
            </Box>

            <Button onClick={generateQRCode} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Generate QR Code
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Modal open={openModal} onClose={handleModalClose}>
        <Box sx={{ padding: 4, backgroundColor: 'white', margin: '50px auto', maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h6">Card Details</Typography>
          <div ref={labelRef} style={{ textAlign: 'center', padding: '10px', border: '1px solid #ccc' }}>
            <Typography>Year: {formData.year}</Typography>
            <Typography>Brand: {formData.brand}</Typography>
            <Typography>Card Number: {formData.card_number}</Typography>
            <Typography>Player: {formData.player}</Typography>
            <Typography>Grade: {formData.grade}</Typography>
            <Typography>Grade Description: {formData.grade_description}</Typography>
            <div ref={qrCodeRef} style={{ marginTop: '10px' }}>
              <QRCodeCanvas value={qrCodeUrl} />
            </div>
          </div>
          <Button onClick={saveQRCodeImage} variant="contained" color="secondary" style={{ marginTop: '20px' }}>Save Card</Button>
          <Button onClick={printLabel} variant="contained" color="primary" style={{ marginTop: '10px' }}>Print Label</Button>
        </Box>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Card saved successfully!"
      />
    </div>
  );
}

export default CardInput;

