import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registrationSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "makesta-secret-key";
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};

// Role middleware
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const registrationData = registrationSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(registrationData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      const user = await storage.createUser(registrationData);
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Pendaftaran berhasil",
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Username atau password salah" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log(`Login failed for user: ${username}, password: ${password}`);
        return res.status(400).json({ message: "Username atau password salah" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login berhasil",
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Materials routes
  app.get("/api/materials", authenticateToken, async (req: any, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/materials", authenticateToken, requireRole(['panitia']), upload.single('file'), async (req: any, res) => {
    try {
      const { title, description } = req.body;
      const file = req.file;

      if (!title) {
        return res.status(400).json({ message: "Judul materi wajib diisi" });
      }

      let filePath = null;
      let fileSize = null;

      if (file) {
        filePath = file.path;
        fileSize = file.size;
      }

      const material = await storage.createMaterial({
        title,
        description,
        filePath,
        fileSize,
        uploadedBy: req.user.id,
      });

      res.json({ message: "Materi berhasil ditambahkan", material });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/materials/:id/download", authenticateToken, async (req: any, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterialById(materialId);

      if (!material) {
        return res.status(404).json({ message: "Materi tidak ditemukan" });
      }

      if (!material.filePath) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      await storage.incrementDownloadCount(materialId);

      res.download(material.filePath, material.title);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/materials/:id", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const success = await storage.deleteMaterial(materialId);

      if (!success) {
        return res.status(404).json({ message: "Materi tidak ditemukan" });
      }

      res.json({ message: "Materi berhasil dihapus" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attendance Sessions routes
  app.get("/api/attendance-sessions", authenticateToken, async (req: any, res) => {
    try {
      const sessions = await storage.getAttendanceSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attendance-sessions", authenticateToken, requireRole(['pemateri']), async (req: any, res) => {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Judul sesi wajib diisi" });
      }

      const session = await storage.createAttendanceSession({
        title,
        description,
        instructorId: req.user.id,
      });

      res.json({ message: "Sesi absensi berhasil dibuat", session });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/attendance-sessions/:id/close", authenticateToken, requireRole(['pemateri']), async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.closeAttendanceSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Sesi tidak ditemukan" });
      }

      res.json({ message: "Sesi berhasil ditutup", session });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attendance Records routes
  app.get("/api/attendance-sessions/:id/records", authenticateToken, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const records = await storage.getAttendanceRecords(sessionId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attendance-records", authenticateToken, requireRole(['peserta']), async (req: any, res) => {
    try {
      const { sessionId, status = 'hadir', notes } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "ID sesi wajib diisi" });
      }

      const record = await storage.createAttendanceRecord({
        sessionId,
        participantId: req.user.id,
        status,
        notes,
      });

      res.json({ message: "Absensi berhasil dicatat", record });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Instructors routes
  app.get("/api/instructors", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/instructors", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const { userId, specialization, cv } = req.body;

      if (!userId || !specialization) {
        return res.status(400).json({ message: "User ID dan keahlian wajib diisi" });
      }

      // Update user role to pemateri
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const instructor = await storage.createInstructor({
        userId,
        specialization,
        cv,
      });

      res.json({ message: "Pemateri berhasil ditambahkan", instructor });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Grades routes
  app.get("/api/grades", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const grades = await storage.getGrades();
      res.json(grades);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/grades", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const { participantId, assignmentScore, examScore, finalScore } = req.body;

      if (!participantId) {
        return res.status(400).json({ message: "ID peserta wajib diisi" });
      }

      const grade = await storage.createGrade({
        participantId,
        assignmentScore,
        examScore,
        finalScore,
      });

      res.json({ message: "Nilai berhasil ditambahkan", grade });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/grades/:id", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const gradeId = parseInt(req.params.id);
      const { assignmentScore, examScore, finalScore } = req.body;

      const grade = await storage.updateGrade(gradeId, {
        assignmentScore,
        examScore,
        finalScore,
      });

      if (!grade) {
        return res.status(404).json({ message: "Nilai tidak ditemukan" });
      }

      res.json({ message: "Nilai berhasil diperbarui", grade });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Certificates routes
  app.get("/api/certificates", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const certificates = await storage.getCertificates();
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/certificates", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const { participantId, certificateType = 'completion', notes = '' } = req.body;

      if (!participantId) {
        return res.status(400).json({ message: "ID peserta wajib diisi" });
      }

      const certificate = await storage.createCertificate({
        participantId,
        certificateType,
        issuedAt: new Date(),
        notes,
      });

      res.json({ message: "Sertifikat berhasil dibuat", certificate });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete certificate
  app.delete("/api/certificates/:id", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const certificateId = parseInt(req.params.id);
      const success = await storage.deleteCertificate(certificateId);
      
      if (!success) {
        return res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      }

      res.json({ message: "Sertifikat berhasil dihapus" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Materials download route
  app.get("/api/materials/:id/download", authenticateToken, async (req: any, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterialById(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Materi tidak ditemukan" });
      }

      // Increment download count
      await storage.incrementDownloadCount(materialId);

      if (material.filePath && fs.existsSync(material.filePath)) {
        res.download(material.filePath, material.title);
      } else {
        res.status(404).json({ message: "File tidak ditemukan" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete material
  app.delete("/api/materials/:id", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const success = await storage.deleteMaterial(materialId);
      
      if (!success) {
        return res.status(404).json({ message: "Materi tidak ditemukan" });
      }

      res.json({ message: "Materi berhasil dihapus" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete instructor
  app.delete("/api/instructors/:id", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const instructorId = parseInt(req.params.id);
      const success = await storage.deleteInstructor(instructorId);
      
      if (!success) {
        return res.status(404).json({ message: "Pemateri tidak ditemukan" });
      }

      res.json({ message: "Pemateri berhasil dihapus" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create instructor
  app.post("/api/instructors", authenticateToken, requireRole(['panitia']), async (req: any, res) => {
    try {
      const { userId, specialization, cv = '' } = req.body;

      if (!userId || !specialization) {
        return res.status(400).json({ message: "User ID dan spesialisasi wajib diisi" });
      }

      const instructor = await storage.createInstructor({
        userId,
        specialization,
        cv,
        status: 'active',
      });

      res.json({ message: "Pemateri berhasil ditambahkan", instructor });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Participants routes
  app.get("/api/participants", authenticateToken, requireRole(['panitia', 'pemateri']), async (req: any, res) => {
    try {
      const participants = await storage.getParticipants();
      res.json(participants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attendance sessions routes
  app.get("/api/attendance-sessions", authenticateToken, requireRole(['panitia', 'pemateri']), async (req: any, res) => {
    try {
      const sessions = await storage.getAttendanceSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attendance-sessions", authenticateToken, requireRole(['panitia', 'pemateri']), async (req: any, res) => {
    try {
      const { title, description = '', sessionDate } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Judul sesi wajib diisi" });
      }

      const session = await storage.createAttendanceSession({
        title,
        description,
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
        isActive: true,
        instructorId: req.user.id,
      });

      res.json({ message: "Sesi absensi berhasil dibuat", session });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/attendance-sessions/:id/records", authenticateToken, requireRole(['panitia', 'pemateri']), async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const records = await storage.getAttendanceRecords(sessionId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attendance-sessions/:id/close", authenticateToken, requireRole(['panitia', 'pemateri']), async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.closeAttendanceSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Sesi tidak ditemukan" });
      }

      res.json({ message: "Sesi berhasil ditutup", session });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attendance records routes
  app.post("/api/attendance-records", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId, participantId, status = 'present' } = req.body;
      
      if (!sessionId || !participantId) {
        return res.status(400).json({ message: "Session ID dan Participant ID wajib diisi" });
      }

      const record = await storage.createAttendanceRecord({
        sessionId,
        participantId,
        status,
        recordedAt: new Date(),
      });

      res.json({ message: "Absensi berhasil dicatat", record });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
