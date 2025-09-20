const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middleware/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();


const isOwner = (req, res, next) => {
  if (req.user.role !== "OWNER") {
    return res.status(403).json({ error: "Access denied. Owner only." });
  }
  next();
};


router.put("/password", authMiddleware, isOwner, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const owner = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!owner) return res.status(404).json({ error: "Owner not found" });

    
    if (owner.password !== old_password) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: new_password }
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/stores/:id/ratings", authMiddleware, isOwner, async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store || store.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Access denied for this store" });
    }

    const ratings = await prisma.rating.findMany({
      where: { storeId },
      include: { user: true }
    });

    const response = ratings.map((r) => ({
      user_name: r.user.name,
      email: r.user.email,
      rating: r.rating
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/stores/:id/summary", authMiddleware, isOwner, async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { ratings: true }
    });

    if (!store || store.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Access denied for this store" });
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : null;

    res.json({
      average_rating: averageRating,
      total_ratings: totalRatings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
