import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Box,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AdminHeader from "./AdminHeader";
import QrCodeLabelModal from "./QrCodeLabelModal";
import BatchModal from "./BatchModal";

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
  const [batchCount, setBatchCount] = useState(1); // New state for batch count
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [cardDocRef, setCardDocRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openBatchModal, setOpenBatchModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === "grade" && {
        grade_description:
          value === "8" ? "Near Mint" : value === "9" ? "Mint" : "Gem Mint",
      }),
    });
  };

  const onDropFront = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFrontImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
  }, []);

  const onDropBack = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setBackImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
  }, []);

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
    setOpenSnackbar(true);
    setOpenModal(false);
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

  const handleBatchComplete = () => {
    setOpenBatchModal(false);
    alert("Batch created successfully!");
  };

  const sharedStyles = {
    height: "56px",
    "& .MuiInputBase-root": {
      height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
    },
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={sharedStyles}>
                  <InputLabel id="year-label" sx={{ backgroundColor: "white", px: 1 }}>
                    YEAR
                  </InputLabel>
                  <Select
                    labelId="year-label"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                  >
                    {Array.from({ length: 50 }, (_, i) => 2025 - i).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="BRAND"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={sharedStyles}>
                  <InputLabel id="sport-label" sx={{ backgroundColor: "white", px: 1 }}>
                    SPORT
                  </InputLabel>
                  <Select
                    labelId="sport-label"
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Baseball">Baseball</MenuItem>
                    <MenuItem value="Football">Football</MenuItem>
                    <MenuItem value="Basketball">Basketball</MenuItem>
                    <MenuItem value="Golf">Golf</MenuItem>
                    <MenuItem value="Hockey">Hockey</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="CARD NUMBER"
                  name="card_number"
                  value={formData.card_number}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="PLAYER"
                  name="player"
                  value={formData.player}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={sharedStyles}>
                  <InputLabel id="grade-label" sx={{ backgroundColor: "white", px: 1 }}>
                    GRADE
                  </InputLabel>
                  <Select
                    labelId="grade-label"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="8">8</MenuItem>
                    <MenuItem value="9">9</MenuItem>
                    <MenuItem value="10">10</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="GRADE DESCRIPTION"
                  name="grade_description"
                  value={formData.grade_description}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Box display="flex" alignItems="center">
                <TextField
                  label="Batch Count"
                  type="number"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.max(0, parseInt(e.target.value || 0)))}
                  sx={{ width: "120px", marginRight: 2 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenBatchModal(true)}
                  disabled={batchCount <= 1}
                >
                  Create Batch
                </Button>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={generateQRCode}
                disabled={batchCount > 1 || loading}
              >
                {loading ? <CircularProgress size={24} /> : "Generate QR Code"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <QrCodeLabelModal
        open={openModal}
        onClose={handleSaveComplete}
        formData={formData}
        qrCodeUrl={qrCodeUrl}
        cardDocRef={cardDocRef}
        onSaveComplete={handleSaveComplete}
      />

      <BatchModal
        open={openBatchModal}
        onClose={() => setOpenBatchModal(false)}
        formData={formData}
        batchCount={batchCount} // Pass batchCount dynamically
        onBatchComplete={handleBatchComplete}
      />      

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Card saved successfully!"
      />
    </div>
  );
}

export default CardInput;

