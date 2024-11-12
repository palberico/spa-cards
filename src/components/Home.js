import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import Header from "./Header";

function Home() {
  const [cards, setCards] = useState([]);
  const [search] = useState("");

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

  return (
    <div>
      <Header />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell> {/* Front Image Column */}
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
            {filteredCards.map((card) => (
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
      </TableContainer>
    </div>
  );
}

export default Home;
