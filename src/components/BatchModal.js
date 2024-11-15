import React, { useState, useRef, useEffect } from "react";
import { Modal, Box, Typography, Button, CircularProgress } from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { db, storage } from "../firebase";

function BatchModal({ open, onClose, formData = {}, batchCount = 1, onBatchComplete }) {
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);
  const labelRefs = useRef([]);
  const [gradeImageUrls, setGradeImageUrls] = useState({});

  useEffect(() => {
    const loadGradeImages = () => {
      const gradeImages = {};
      labels.forEach((label) => {
        const grade = label.grade || "default";
        if (grade === "10") gradeImages[label.documentId] = "/GMint10.svg";
        else if (grade === "9") gradeImages[label.documentId] = "/Mint9.svg";
        else if (grade === "8") gradeImages[label.documentId] = "/NMMint8.svg";
        else gradeImages[label.documentId] = "/default.svg";
      });
      setGradeImageUrls(gradeImages);
    };

    if (labels.length > 0) loadGradeImages();
  }, [labels]);

  const handleCreateBatch = async () => {
    setLoading(true);
    try {
      const baseUrl = "https://spagrading.com/card";
      const newLabels = [];

      for (let i = 0; i < batchCount; i++) {
        const newCardDocRef = await addDoc(collection(db, "cards"), { ...formData });
        const documentId = newCardDocRef.id;
        const qrCodeUrl = `${baseUrl}/${documentId}`;

        newLabels.push({
          documentId,
          qrCodeUrl,
          player: formData.player,
          year: formData.year,
          brand: formData.brand,
          cardNumber: formData.card_number,
          grade: formData.grade,
          gradeDescription: formData.grade_description,
        });
      }

      setLabels(newLabels);
    } catch (error) {
      console.error("Error during batch creation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLabels = async () => {
    setLoading(true);
    try {
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const labelRef = labelRefs.current[i];

        const canvas = await html2canvas(labelRef, { scale: 2, useCORS: true });
        const labelBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        const labelStorageRef = ref(storage, `labels/${label.documentId}_label.png`);
        await uploadBytes(labelStorageRef, labelBlob);

        const qrCanvas = labelRef.querySelector("canvas");
        const qrBlob = await new Promise((resolve) => qrCanvas.toBlob(resolve, "image/png"));
        const qrCodeStorageRef = ref(storage, `qr_codes/${label.documentId}_qrCode.png`);
        await uploadBytes(qrCodeStorageRef, qrBlob);
      }

      onBatchComplete();
    } catch (error) {
      console.error("Error saving labels:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handlePrintLabels = async () => {
    const labelImages = await Promise.all(
      labelRefs.current.map(async (labelRef) => {
        const canvas = await html2canvas(labelRef, { scale: 2, useCORS: true });
        return canvas.toDataURL("image/png");
      })
    );

    const printWindow = window.open("", "_blank", "width=800,height=600");
    const labelsHTML = labelImages
      .map(
        (imageData) => `
          <div class="label" style="page-break-inside: avoid; display: inline-block; width: 48%; padding: 4px;">
            <img src="${imageData}" style="width: 68mm; height: 20.5mm; display: block; margin: 0 auto;">
          </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              padding: 20px;
              margin: 0;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${labelsHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const renderLabels = () =>
    labels.map((label, index) => (
      <div
        key={index}
        ref={(el) => (labelRefs.current[index] = el)}
        style={{
          width: "48%",
          height: "20.5mm",
          display: "grid",
          gridTemplateColumns: "50% 50%",
          alignItems: "center",
          padding: "4px",
          border: "6.5px solid #0047ab",
          borderRadius: "4px",
          boxSizing: "border-box",
          backgroundColor: "white",
          marginBottom: "16px",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" sx={{ paddingLeft: "4px" }}>
          <img src="/SPA Logo.svg" alt="SPA Logo" style={{ height: "4mm", marginBottom: "2px" }} />
          <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{label.player}</Typography>
          <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{`${label.year} ${label.brand}`}</Typography>
          <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{`#${label.cardNumber}`}</Typography>
        </Box>

        <Box display="grid" gridTemplateRows="75% 25%" alignItems="center" justifyContent="center" height="100%">
          <Box display="grid" gridTemplateColumns="50% 50%" alignItems="center" justifyContent="center">
            <Box display="flex" justifyContent="center" alignItems="center">
              <QRCodeCanvas value={label.qrCodeUrl} size={36} />
            </Box>
            {gradeImageUrls[label.documentId] && (
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  src={gradeImageUrls[label.documentId]}
                  alt={`Grade ${label.grade}`}
                  style={{ height: "10mm", width: "auto" }}
                />
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ paddingRight: "4px" }}>
            <Typography variant="body2" style={{ fontSize: "6pt", textAlign: "right" }}>
              {label.documentId}
            </Typography>
          </Box>
        </Box>
      </div>
    ));

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          maxWidth: 700,
          margin: "50px auto",
          borderRadius: 2,
          overflowY: "scroll",
          maxHeight: "90vh",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Batch Labels
        </Typography>

        {labels.length === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBatch}
            disabled={loading || batchCount < 1}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Generate Batch"}
          </Button>
        )}

        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="space-between">
          {renderLabels()}
        </Box>

        {labels.length > 0 && (
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveLabels}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save Labels"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePrintLabels}
            >
              Print Labels
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default BatchModal;
