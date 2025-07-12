import { users, participants, instructors, materials, attendanceSessions, attendanceRecords, grades, certificates, type User, type InsertUser, type Participant, type InsertParticipant, type Instructor, type InsertInstructor, type Material, type InsertMaterial, type AttendanceSession, type InsertAttendanceSession, type AttendanceRecord, type InsertAttendanceRecord, type Grade, type InsertGrade, type Certificate, type InsertCertificate, type Registration } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Auth
  createUser(userData: Registration): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  
  // Participants
  getParticipants(): Promise<(Participant & { user: User })[]>;
  getParticipantByUserId(userId: number): Promise<Participant | undefined>;
  
  // Instructors
  getInstructors(): Promise<(Instructor & { user: User })[]>;
  getInstructorByUserId(userId: number): Promise<Instructor | undefined>;
  createInstructor(instructorData: InsertInstructor & { userId: number }): Promise<Instructor>;
  updateInstructor(id: number, instructorData: Partial<InsertInstructor>): Promise<Instructor | undefined>;
  deleteInstructor(id: number): Promise<boolean>;
  
  // Materials
  getMaterials(): Promise<(Material & { uploadedBy: User })[]>;
  getMaterialById(id: number): Promise<Material | undefined>;
  createMaterial(materialData: InsertMaterial & { uploadedBy: number }): Promise<Material>;
  updateMaterial(id: number, materialData: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  incrementDownloadCount(id: number): Promise<void>;
  
  // Attendance Sessions
  getAttendanceSessions(): Promise<(AttendanceSession & { instructor: User })[]>;
  getAttendanceSessionById(id: number): Promise<AttendanceSession | undefined>;
  createAttendanceSession(sessionData: InsertAttendanceSession & { instructorId: number }): Promise<AttendanceSession>;
  closeAttendanceSession(id: number): Promise<AttendanceSession | undefined>;
  
  // Attendance Records
  getAttendanceRecords(sessionId: number): Promise<(AttendanceRecord & { participant: User })[]>;
  createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: number, recordData: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined>;
  
  // Grades
  getGrades(): Promise<(Grade & { participant: User })[]>;
  getGradesByParticipant(participantId: number): Promise<Grade | undefined>;
  createGrade(gradeData: InsertGrade): Promise<Grade>;
  updateGrade(id: number, gradeData: Partial<InsertGrade>): Promise<Grade | undefined>;
  
  // Certificates
  getCertificates(): Promise<(Certificate & { participant: User })[]>;
  getCertificatesByParticipant(participantId: number): Promise<Certificate[]>;
  createCertificate(certificateData: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, certificateData: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  deleteCertificate(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async createUser(userData: Registration): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        role: "peserta",
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      })
      .returning();

    // Create participant record
    await db.insert(participants).values({
      userId: user.id,
      birthPlace: userData.birthPlace,
      address: userData.address,
      elementary: userData.elementary,
      juniorHigh: userData.juniorHigh || null,
      seniorHigh: userData.seniorHigh || null,
      purpose: userData.purpose,
      organizationExperience: userData.organizationExperience || null,
      interests: userData.interests,
      talents: userData.talents,
      motto: userData.motto || null,
    });

    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Participants
  async getParticipants(): Promise<(Participant & { user: User })[]> {
    const result = await db
      .select()
      .from(participants)
      .leftJoin(users, eq(participants.userId, users.id))
      .orderBy(desc(participants.createdAt));
    
    return result.map(row => ({
      ...row.participants,
      user: row.users!,
    }));
  }

  async getParticipantByUserId(userId: number): Promise<Participant | undefined> {
    const [participant] = await db.select().from(participants).where(eq(participants.userId, userId));
    return participant || undefined;
  }

  // Instructors
  async getInstructors(): Promise<(Instructor & { user: User })[]> {
    const result = await db
      .select()
      .from(instructors)
      .leftJoin(users, eq(instructors.userId, users.id))
      .orderBy(desc(instructors.createdAt));
    
    return result.map(row => ({
      ...row.instructors,
      user: row.users!,
    }));
  }

  async getInstructorByUserId(userId: number): Promise<Instructor | undefined> {
    const [instructor] = await db.select().from(instructors).where(eq(instructors.userId, userId));
    return instructor || undefined;
  }

  async createInstructor(instructorData: InsertInstructor & { userId: number }): Promise<Instructor> {
    const [instructor] = await db
      .insert(instructors)
      .values(instructorData)
      .returning();
    return instructor;
  }

  async updateInstructor(id: number, instructorData: Partial<InsertInstructor>): Promise<Instructor | undefined> {
    const [instructor] = await db
      .update(instructors)
      .set(instructorData)
      .where(eq(instructors.id, id))
      .returning();
    return instructor || undefined;
  }

  async deleteInstructor(id: number): Promise<boolean> {
    const result = await db.delete(instructors).where(eq(instructors.id, id));
    return result.rowCount > 0;
  }

  // Materials
  async getMaterials(): Promise<(Material & { uploadedBy: User })[]> {
    const result = await db
      .select()
      .from(materials)
      .leftJoin(users, eq(materials.uploadedBy, users.id))
      .orderBy(desc(materials.createdAt));
    
    return result.map(row => ({
      ...row.materials,
      uploadedBy: row.users!,
    }));
  }

  async getMaterialById(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(materialData: InsertMaterial & { uploadedBy: number }): Promise<Material> {
    const [material] = await db
      .insert(materials)
      .values(materialData)
      .returning();
    return material;
  }

  async updateMaterial(id: number, materialData: Partial<InsertMaterial>): Promise<Material | undefined> {
    const [material] = await db
      .update(materials)
      .set(materialData)
      .where(eq(materials.id, id))
      .returning();
    return material || undefined;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    const result = await db.delete(materials).where(eq(materials.id, id));
    return result.rowCount > 0;
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await db
      .update(materials)
      .set({ downloadCount: materials.downloadCount + 1 })
      .where(eq(materials.id, id));
  }

  // Attendance Sessions
  async getAttendanceSessions(): Promise<(AttendanceSession & { instructor: User })[]> {
    const result = await db
      .select()
      .from(attendanceSessions)
      .leftJoin(users, eq(attendanceSessions.instructorId, users.id))
      .orderBy(desc(attendanceSessions.createdAt));
    
    return result.map(row => ({
      ...row.attendance_sessions,
      instructor: row.users!,
    }));
  }

  async getAttendanceSessionById(id: number): Promise<AttendanceSession | undefined> {
    const [session] = await db.select().from(attendanceSessions).where(eq(attendanceSessions.id, id));
    return session || undefined;
  }

  async createAttendanceSession(sessionData: InsertAttendanceSession & { instructorId: number }): Promise<AttendanceSession> {
    const [session] = await db
      .insert(attendanceSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async closeAttendanceSession(id: number): Promise<AttendanceSession | undefined> {
    const [session] = await db
      .update(attendanceSessions)
      .set({ isActive: false, closedAt: new Date() })
      .where(eq(attendanceSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Attendance Records
  async getAttendanceRecords(sessionId: number): Promise<(AttendanceRecord & { participant: User })[]> {
    const result = await db
      .select()
      .from(attendanceRecords)
      .leftJoin(users, eq(attendanceRecords.participantId, users.id))
      .where(eq(attendanceRecords.sessionId, sessionId))
      .orderBy(desc(attendanceRecords.checkInTime));
    
    return result.map(row => ({
      ...row.attendance_records,
      participant: row.users!,
    }));
  }

  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db
      .insert(attendanceRecords)
      .values(recordData)
      .returning();
    return record;
  }

  async updateAttendanceRecord(id: number, recordData: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const [record] = await db
      .update(attendanceRecords)
      .set(recordData)
      .where(eq(attendanceRecords.id, id))
      .returning();
    return record || undefined;
  }

  // Grades
  async getGrades(): Promise<(Grade & { participant: User })[]> {
    const result = await db
      .select()
      .from(grades)
      .leftJoin(users, eq(grades.participantId, users.id))
      .orderBy(desc(grades.createdAt));
    
    return result.map(row => ({
      ...row.grades,
      participant: row.users!,
    }));
  }

  async getGradesByParticipant(participantId: number): Promise<Grade | undefined> {
    const [grade] = await db.select().from(grades).where(eq(grades.participantId, participantId));
    return grade || undefined;
  }

  async createGrade(gradeData: InsertGrade): Promise<Grade> {
    const [grade] = await db
      .insert(grades)
      .values(gradeData)
      .returning();
    return grade;
  }

  async updateGrade(id: number, gradeData: Partial<InsertGrade>): Promise<Grade | undefined> {
    const [grade] = await db
      .update(grades)
      .set({ ...gradeData, updatedAt: new Date() })
      .where(eq(grades.id, id))
      .returning();
    return grade || undefined;
  }

  // Certificates
  async getCertificates(): Promise<(Certificate & { participant: User })[]> {
    const result = await db
      .select()
      .from(certificates)
      .leftJoin(users, eq(certificates.participantId, users.id))
      .orderBy(desc(certificates.issuedAt));
    
    return result.map(row => ({
      ...row.certificates,
      participant: row.users!,
    }));
  }

  async getCertificatesByParticipant(participantId: number): Promise<Certificate[]> {
    const result = await db.select().from(certificates).where(eq(certificates.participantId, participantId));
    return result;
  }

  async createCertificate(certificateData: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(certificateData)
      .returning();
    return certificate;
  }

  async updateCertificate(id: number, certificateData: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const [certificate] = await db
      .update(certificates)
      .set(certificateData)
      .where(eq(certificates.id, id))
      .returning();
    return certificate || undefined;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    const result = await db.delete(certificates).where(eq(certificates.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
