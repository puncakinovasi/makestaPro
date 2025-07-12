import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["peserta", "pemateri", "panitia"] }).notNull().default("peserta"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  birthPlace: text("birth_place").notNull(),
  address: text("address").notNull(),
  elementary: text("elementary").notNull(),
  juniorHigh: text("junior_high"),
  seniorHigh: text("senior_high"),
  purpose: text("purpose").notNull(),
  organizationExperience: text("organization_experience"),
  interests: text("interests").notNull(),
  talents: text("talents").notNull(),
  motto: text("motto"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization").notNull(),
  cv: text("cv"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  downloadCount: integer("download_count").default(0),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendanceSessions = pgTable("attendance_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => attendanceSessions.id).notNull(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["hadir", "tidak_hadir", "terlambat"] }).notNull(),
  checkInTime: timestamp("check_in_time").defaultNow(),
  notes: text("notes"),
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  assignmentScore: integer("assignment_score"),
  examScore: integer("exam_score"),
  finalScore: integer("final_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => users.id).notNull(),
  filePath: text("file_path"),
  issuedAt: timestamp("issued_at").defaultNow(),
  status: text("status", { enum: ["draft", "issued", "revoked"] }).notNull().default("draft"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  participant: one(participants, {
    fields: [users.id],
    references: [participants.userId],
  }),
  instructor: one(instructors, {
    fields: [users.id],
    references: [instructors.userId],
  }),
  uploadedMaterials: many(materials),
  attendanceSessions: many(attendanceSessions),
  attendanceRecords: many(attendanceRecords),
  grades: many(grades),
  certificates: many(certificates),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
}));

export const instructorsRelations = relations(instructors, ({ one }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [materials.uploadedBy],
    references: [users.id],
  }),
}));

export const attendanceSessionsRelations = relations(attendanceSessions, ({ one, many }) => ({
  instructor: one(users, {
    fields: [attendanceSessions.instructorId],
    references: [users.id],
  }),
  records: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  session: one(attendanceSessions, {
    fields: [attendanceRecords.sessionId],
    references: [attendanceSessions.id],
  }),
  participant: one(users, {
    fields: [attendanceRecords.participantId],
    references: [users.id],
  }),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  participant: one(users, {
    fields: [grades.participantId],
    references: [users.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  participant: one(users, {
    fields: [certificates.participantId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  uploadedBy: true,
  downloadCount: true,
  createdAt: true,
});

export const insertAttendanceSessionSchema = createInsertSchema(attendanceSessions).omit({
  id: true,
  instructorId: true,
  createdAt: true,
  closedAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  checkInTime: true,
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

// Registration schema that combines user and participant data
export const registrationSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  birthPlace: z.string().min(1, "Tempat, tanggal lahir wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  elementary: z.string().min(1, "Riwayat SD/MI wajib diisi"),
  juniorHigh: z.string().optional(),
  seniorHigh: z.string().optional(),
  purpose: z.string().min(1, "Tujuan mengikuti Makesta wajib diisi"),
  organizationExperience: z.string().optional(),
  interests: z.string().min(1, "Minat wajib diisi"),
  talents: z.string().min(1, "Bakat wajib diisi"),
  motto: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type AttendanceSession = typeof attendanceSessions.$inferSelect;
export type InsertAttendanceSession = z.infer<typeof insertAttendanceSessionSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Registration = z.infer<typeof registrationSchema>;
