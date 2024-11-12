import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";
import Header from "./Header";

function Home() {
  const [cards, setCards] = useState([]);
  const [search] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const cardSnapshot = await getDocs(cardsCollection);
      setCards(cardSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchCards();
  }, []);

  const filteredCards = cards.filter(
    (card) =>
      card.cert_number?.includes(search) ||
      card.player?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      <Header />

      {/* Introductory Text */}
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Certificate Verification
        </Typography>
        <Typography variant="body1" align="center" sx={{ maxWidth: 600, mb: 1 }}>
          Verify the validity of SPA certification numbers using the search field above, 
          or by scrolling through our datbase below. Always confirm certification numbers 
          for collectibles purchased online after receipt.
        </Typography>
      </Box>

      {/* Table with Cards */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell> {/* Front Image Column */}
              <TableCell>Cert #</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Player</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Card Number</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell></TableCell> {/* QR Code Column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCards.map((card) => (
              <TableRow
                key={card.id}
                component={Link}
                to={`/card/${card.id}`}
                style={{ cursor: "pointer", textDecoration: "none" }}
              >
                <TableCell>
                  {card.imageFront && (
                    <img
                      src={card.imageFront}
                      alt="Card Front"
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                  )}
                </TableCell>
                <TableCell>{card.id}</TableCell>
                <TableCell>{card.sport}</TableCell>
                <TableCell>{card.player}</TableCell>
                <TableCell>{card.year}</TableCell>
                <TableCell>{card.brand}</TableCell>
                <TableCell>{card.card_number}</TableCell>
                <TableCell>{card.grade}</TableCell>
                <TableCell>
                  {card.qr_code && (
                    <img
                      src={card.qr_code}
                      alt="QR Code"
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Pagination
            count={Math.ceil(filteredCards.length / rowsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </TableContainer>
    </div>
  );
}

export default Home;
