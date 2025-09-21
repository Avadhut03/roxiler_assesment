const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/stores", authMiddleware, async (req, res) => {
  try {
    const { name, address } = req.query;

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: "insensitive" } } : {},
          address ? { address: { contains: address, mode: "insensitive" } } : {},
        ],
      },
      include: {
        ratings: true,
      },
    });

    const response = stores.map((store) => {
      const avgRating =
        store.ratings.length > 0
          ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
          : null;

      const userRating =
        store.ratings.find((r) => r.userId === req.user.id)?.rating || null;

      return {
        id: store.id,
        store_name: store.name,
        address: store.address,
        avg_rating: avgRating,
        user_rating: userRating,
      };
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/stores/:id/ratings", authMiddleware, async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = parseInt(req.params.id);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    const existing = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "You already submitted a rating for this store" });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        userId: req.user.id,
        storeId,
      },
    });

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/stores/:id/ratings", authMiddleware, async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = parseInt(req.params.id);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    const updated = await prisma.rating.update({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
      data: { rating },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "No rating found for this store" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
