import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CardContent, Typography, Box, CardMedia } from "@mui/material";
import Header from "./Header"; // Import the Header component

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
      <Header /> {/* Add the Header component */}
      {card ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ padding: 2, width: "100%", maxWidth: 800, margin: "0 auto" }}
        >
          <CardContent>
            <Typography variant="h5" textAlign="center">{card.player}</Typography>
            <Typography color="textSecondary" textAlign="center">
              SPA Certification Number: {id}
            </Typography>
            {/* Add other card details here if needed */}
          </CardContent>

          {/* Display images side-by-side on larger screens and stack on smaller screens */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="center"
            alignItems="center"
            gap={2}
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
                objectFit: "contain",
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
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </div>
  );
}

export default CardDetail;
