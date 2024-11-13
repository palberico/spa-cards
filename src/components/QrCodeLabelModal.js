import React, { useRef } from "react";
import { Button, Typography, Modal, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

function QrCodeLabelModal({ open, onClose, formData, qrCodeUrl, cardDocRef, printLabel }) {
  const labelRef = useRef(null);

  // Function to save the QR code image to Firebase
  const handleSaveQRCodeImage = async () => {
    if (!cardDocRef || !labelRef.current) return;

    const canvas = labelRef.current.querySelector("canvas");
    if (!canvas) {
      console.error("QR code canvas not found");
      return;
    }

    // Convert the canvas to a Blob and upload to Firebase Storage
    canvas.toBlob(async (blob) => {
      try {
        const qrCodeRefStorage = ref(storage, `qr_codes/${cardDocRef.id}_qrCode.png`);
        await uploadBytes(qrCodeRefStorage, blob);
        const qrCodeImageUrl = await getDownloadURL(qrCodeRefStorage);

        // Update the Firestore document with the QR code image URL
        await updateDoc(doc(db, "cards", cardDocRef.id), { qr_code: qrCodeImageUrl });

        onClose(); // Close the modal after saving
      } catch (error) {
        console.error("Error saving QR code image:", error);
      }
    });
  };

  // Handle printing the label
  const handlePrintLabel = async () => {
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
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 4, backgroundColor: 'white', maxWidth: 500, margin: '50px auto', textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Label Details</Typography>
        <div ref={labelRef} style={{ display: 'flex', justifyContent: 'space-between', padding: 2, border: '1px solid #0047ab', borderRadius: 2 }}>
          <Box>
            <img src="/SPA Logo.svg" alt="SPA Logo" style={{ height: '4mm' }} />
            <Typography>{formData.player}</Typography>
            <Typography>{formData.year} {formData.brand}</Typography>
            <Typography>#{formData.card_number}</Typography>
          </Box>
          <Box>
            <QRCodeCanvas value={qrCodeUrl} size={50} />
            <Typography>{cardDocRef ? cardDocRef.id : ""}</Typography>
          </Box>
          <Typography variant="h4">{formData.grade}</Typography>
        </div>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="contained" color="secondary" onClick={handleSaveQRCodeImage}>Save Card</Button>
          <Button variant="contained" color="primary" onClick={handlePrintLabel}>Print Label</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default QrCodeLabelModal;
