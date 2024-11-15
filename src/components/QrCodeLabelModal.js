import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button, Typography, Modal, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

function QrCodeLabelModal({ open, onClose, formData, qrCodeUrl, cardDocRef, onSaveComplete }) {
  const labelRef = useRef(null);
  const [gradeImageUrl, setGradeImageUrl] = useState("");

  const loadGradeImage = useCallback(() => {
    const grade = formData.grade;
    let localPath;

    if (grade === "10") localPath = "/GMint10.svg";
    else if (grade === "9") localPath = "/Mint9.svg";
    else if (grade === "8") localPath = "/NMMint8.svg";
    else localPath = "/default.svg";

    console.log(`Selected local image path: ${localPath}`);
    setGradeImageUrl(localPath);
  }, [formData.grade]);

  useEffect(() => {
    loadGradeImage();
  }, [loadGradeImage]);

  const handleSaveLabelImage = async () => {
    if (!cardDocRef) return;
    const documentId = cardDocRef.id;

    try {
      const canvas = await html2canvas(labelRef.current, { scale: 2, useCORS: true });
      const labelBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const labelStorageRef = ref(storage, `labels/${documentId}_label.png`);
      await uploadBytes(labelStorageRef, labelBlob);
      console.log(`Label image uploaded to: labels/${documentId}_label.png`);

      const qrCanvas = document.querySelector("canvas");
      const qrBlob = await new Promise((resolve) => qrCanvas.toBlob(resolve, "image/png"));
      const qrCodeStorageRef = ref(storage, `qr_codes/${documentId}_qrCode.png`);
      await uploadBytes(qrCodeStorageRef, qrBlob);
      console.log(`QR code image uploaded to: qr_codes/${documentId}_qrCode.png`);

      if (onSaveComplete) onSaveComplete();
    } catch (error) {
      console.error("Error saving label and QR code images:", error);
    }
  };

  const handlePrintLabel = async () => {
    try {
      const canvas = await html2canvas(labelRef.current, { scale: 2, useCORS: true });
      const imageData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label</title>
            <style>
              @media print {
                .no-print { display: none; }
                body, html {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                #printLabel {
                  width: 69.5mm;
                  height: 20.5mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-sizing: border-box;
                  padding: 8px;
                }
              }
            </style>
          </head>
          <body onload="window.print();window.close()">
            <div id="printLabel">
              <img src="${imageData}" alt="Label" style="width: 69.5mm; height: 20.5mm;" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing the label:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          maxWidth: 500,
          margin: "50px auto",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Label Details
        </Typography>
        <div
          ref={labelRef}
          style={{
            width: "69.5mm",
            height: "20.5mm",
            display: "grid",
            gridTemplateColumns: "50% 50%",
            alignItems: "center",
            padding: "4px 8px",
            border: "6.5px solid #0047ab",
            borderRadius: "4px",
            boxSizing: "border-box",
            backgroundColor: "white",
          }}
        >
          {/* Column 1: Logo and Player Details */}
          <Box display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" sx={{ paddingLeft: "4px" }}>
            <img src="/SPA Logo.svg" alt="SPA Logo" style={{ height: "4mm", marginBottom: "2px" }} />
            <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{formData.player}</Typography>
            <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{`${formData.year} ${formData.brand}`}</Typography>
            <Typography variant="body2" style={{ fontSize: "7pt", textAlign: "left" }}>{`#${formData.card_number}`}</Typography>
          </Box>

          {/* Column 2: QR Code, Grade Image, and Document ID */}
          <Box display="grid" gridTemplateRows="75% 25%" alignItems="center" justifyContent="center" height="100%">
            <Box display="grid" gridTemplateColumns="50% 50%" alignItems="center" justifyContent="center">
              <Box display="flex" justifyContent="center" alignItems="center">
                <QRCodeCanvas value={qrCodeUrl} size={36} />
              </Box>
              {gradeImageUrl && (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img
                    src={gradeImageUrl}
                    alt={`Grade ${formData.grade}`}
                    style={{ height: "10mm", width: "auto" }}
                  />
                </Box>
              )}
            </Box>
            <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ paddingRight: "4px" }}>
              <Typography variant="body2" style={{ fontSize: "6pt", textAlign: "right" }}>
                {cardDocRef ? cardDocRef.id : ""}
              </Typography>
            </Box>
          </Box>
        </div>

        {/* Save and Print Buttons - with "no-print" class */}
        <Box display="flex" justifyContent="space-between" mt={2} className="no-print">
          <Button variant="contained" color="secondary" onClick={handleSaveLabelImage}>
            Save Label
          </Button>
          <Button variant="contained" color="primary" onClick={handlePrintLabel}>
            Print Label
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default QrCodeLabelModal;
