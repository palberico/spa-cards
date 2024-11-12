import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Typography,
  Box,
  CardMedia,
  Divider,
  Paper,
} from "@mui/material";
import Header from "./Header";

function CardDetail() {
  const { id } = useParams();
  const [card, setCard] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      const docRef = doc(db, "cards", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCard(docSnap.data());
      }
    };
    fetchCard();
  }, [id]);

  return (
    <div>
      <Header />
      {/* Main Content Offset to Avoid Overlap */}
      <Box sx={{ pt: { xs: 8, sm: 10 } }}>  {/* Adjust pt as needed */}
        {card ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{ padding: 4, width: "100%", maxWidth: 800, margin: "0 auto" }}
          >
            {/* Card Details Section */}
            <Paper elevation={3} sx={{ width: "100%", padding: 3, marginBottom: 4 }}>
              <Typography variant="h5" textAlign="center" gutterBottom>
                {card.player}
              </Typography>
              <Typography variant="body1" textAlign="center" color="textSecondary" gutterBottom>
                SPA Certification Number: {id}
              </Typography>

              <Divider sx={{ marginY: 2 }} />

              <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  <strong>Sport:</strong> {card.sport}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Brand:</strong> {card.brand}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Year:</strong> {card.year}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Card Number:</strong> {card.card_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Grade:</strong> {card.grade}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Grade Description:</strong> {card.grade_description}
                </Typography>
              </Box>
            </Paper>

            {/* Display Images */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="center"
              alignItems="center"
              gap={3}
              width="100%"
            >
              <CardMedia
                component="img"
                image={card.imageFront}
                alt="Card Front"
                sx={{
                  width: { xs: "100%", sm: "45%" },
                  height: "auto",
                  maxWidth: 400,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
              <CardMedia
                component="img"
                image={card.imageBack}
                alt="Card Back"
                sx={{
                  width: { xs: "100%", sm: "45%" },
                  height: "auto",
                  maxWidth: 400,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Box>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Box>
    </div>
  );
}

export default CardDetail;

