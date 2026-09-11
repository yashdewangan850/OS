import { Router } from "express";
import mongoose from "mongoose";
import Note from "../models/Note.js";
import FileItem from "../models/FileItem.js";
import Event from "../models/Event.js";

const validUser = (id) =>
  mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id);
export default function syncRoutes(auth) {
  const router = Router();
  router.get("/", auth, async (req, res) => {
    if (!validUser(req.user.id))
      return res.json({ notes: [], files: [], events: [], database: "memory" });
    const [notes, files, events] = await Promise.all([
      Note.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean(),
      FileItem.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean(),
      Event.find({ userId: req.user.id }).sort({ date: 1 }).lean(),
    ]);
    res.json({ notes, files, events, database: "mongodb" });
  });
  router.post("/notes", auth, async (req, res) => {
    if (!validUser(req.user.id))
      return res.status(503).json({ message: "MongoDB is not connected." });
    const notes = Array.isArray(req.body.notes) ? req.body.notes : [];
    await Note.deleteMany({ userId: req.user.id });
    if (notes.length)
      await Note.insertMany(
        notes.map((n) => ({
          userId: req.user.id,
          title: String(n.title || ""),
          content: String(n.content || ""),
          updatedAt: n.updatedAt || new Date(),
        })),
      );
    res.json({ ok: true, count: notes.length });
  });
  router.post("/files", auth, async (req, res) => {
    if (!validUser(req.user.id))
      return res.status(503).json({ message: "MongoDB is not connected." });
    const files = Array.isArray(req.body.files) ? req.body.files : [];
    await FileItem.deleteMany({ userId: req.user.id });
    if (files.length)
      await FileItem.insertMany(
        files.map((f) => ({
          userId: req.user.id,
          name: String(f.name || ""),
          type: String(f.type || "file"),
          location: String(f.location || "Home"),
          size: Number(f.size || 0),
          mimeType: f.mimeType,
          deletedAt: f.deletedAt,
          trashedAt: f.trashedAt,
        })),
      );
    res.json({ ok: true, count: files.length });
  });
  router.post("/events", auth, async (req, res) => {
    if (!validUser(req.user.id))
      return res.status(503).json({ message: "MongoDB is not connected." });
    const events = Array.isArray(req.body.events) ? req.body.events : [];
    await Event.deleteMany({ userId: req.user.id });
    const rows = Object.entries(events).flatMap(([date, list]) =>
      Array.isArray(list)
        ? list.map((e) => ({
            userId: req.user.id,
            date,
            title: String(e.title || ""),
          }))
        : [],
    );
    if (rows.length) await Event.insertMany(rows);
    res.json({ ok: true, count: rows.length });
  });
  return router;
}
