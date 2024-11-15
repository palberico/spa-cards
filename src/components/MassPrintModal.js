import React, { useEffect, useState } from "react";
import { Box, Modal, Button } from "@mui/material";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";

function MassPrintModal({ open, onClose, selectedCards }) {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const labelUrls = await Promise.all(
        selectedCards.map(async (cardId) => {
          try {
            const labelRef = ref(storage, `labels/${cardId}_label.png`);
            const url = await getDownloadURL(labelRef);
            return { id: cardId, url };
          } catch (error) {
            console.error("Error fetching label:", error);
            return null;
          }
        })
      );
      setLabels(labelUrls.filter(Boolean));
    };

    fetchLabels();
  }, [selectedCards]);

  const handlePrint = () => {
    // Temporarily hide the no-print elements during printing
    const noPrintElements = document.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => (el.style.display = "none"));

    // Trigger print
    window.print();

    // Restore the no-print elements after printing
    noPrintElements.forEach((el) => (el.style.display = ""));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          width: "100%",
          maxWidth: "1200px",
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/* Container for Labels */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap={1}
          sx={{
            "@media print": {
              "*": { margin: 0, padding: 0 },
              "body, html": { width: "100%", height: "100%", margin: 0, padding: 0 },
              "img": { display: "block" },
            },
          }}
        >
          {labels.map((label) => (
            <Box
              key={label.id}
              sx={{
                width: "72mm",
                height: "20mm",
                padding: 0,
                boxShadow: "none",
              }}
            >
              <img src={label.url} alt={`Label for ${label.id}`} style={{ width: "100%", height: "100%" }} />
            </Box>
          ))}
        </Box>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-start" mt={2} className="no-print">
          <Button variant="contained" onClick={handlePrint} sx={{ mr: 2 }}>
            Print Labels
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default MassPrintModal;
