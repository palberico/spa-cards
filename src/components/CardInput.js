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

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [67, 20.5],
    });
    pdf.addImage(imageData, "PNG", 0, 0, 67, 20.5);
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
        <Box
          sx={{
            padding: 4,
            backgroundColor: 'white',
            margin: '50px auto',
            maxWidth: 500,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>Label Details</Typography>
          
          <div
            ref={labelRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "white",
              color: "black",
              width: "67mm",
              height: "20.5mm",
              padding: "8px",
              fontFamily: "Arial, sans-serif",
              boxSizing: "border-box",
              border: "3px solid #0047ab",
              borderRadius: "4px",
              marginBottom: '20px',
            }}
          >
            <Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <img src="/SPA Logo.svg" alt="SPA Logo" style={{ height: "4mm", marginBottom: "2px", marginTop: "2px" }} />
              <Typography style={{ fontSize: "12px" }}>{formData.player}</Typography>
              <Typography style={{ fontSize: "12px" }}>{formData.year} {formData.brand}</Typography>
              <Typography style={{ fontSize: "12px" }}>#{formData.card_number}</Typography>
            </Box>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "black",
                marginLeft: "10px",
              }}
              ref={qrCodeRef} // Attach ref here
            >
              <QRCodeCanvas value={qrCodeUrl} size={50} />
              <Typography style={{ fontSize: "8px", color: "black", marginTop: "2px", }}>{cardDocRef ? cardDocRef.id : ""}</Typography>
            </Box>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "black",
                position: "relative",
                top: "-7px",
                marginLeft: "-40px",
              }}
            >
              <Typography 
                style={{ 
                  fontSize: "45px", 
                  fontWeight: "bold",
                  // marginRight: "2px"
                }}
              >
                {formData.grade}
              </Typography>
            </Box>
          </div>

          <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center" }}>
            <Button
              onClick={saveQRCodeImage}
              variant="contained"
              color="secondary"
              sx={{ width: "40%", padding: "10px 0" }}
            >
              Save Card
            </Button>
            <Button
              onClick={printLabel}
              variant="contained"
              color="primary"
              sx={{ width: "40%", padding: "10px 0" }}
            >
              Print Label
            </Button>
          </Box>
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
