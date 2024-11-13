import React, { useRef } from "react";
import { Button, Typography, Modal, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function QrCodeLabelModal({ open, onClose, formData, qrCodeUrl, cardDocRef, saveQRCodeImage, printLabel }) {
  const labelRef = useRef(null);

  const handleSaveAndClose = async () => {
    await saveQRCodeImage();
    onClose(); // Close the modal after saving
  };

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
          <Button variant="contained" color="secondary" onClick={handleSaveAndClose}>Save Card</Button>
          <Button variant="contained" color="primary" onClick={handlePrintLabel}>Print Label</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default QrCodeLabelModal;
