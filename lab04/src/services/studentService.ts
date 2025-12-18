import fs from "fs";
import path from "path";
import { Student } from "../models/student";
const dataPath = path.join(process.cwd(), "src", "data", "students.json");
// I don't implement fs.promises because it's too much work dealing with async/await/promises .-.
// nvm, i'll do it.
export async function loadStudents(): Promise<Student[]> {
  const text = await fs.promises.readFile(dataPath, "utf-8");
  return JSON.parse(text) as Student[];
}
export async function saveStudents(students: Student[]): Promise<void> {
  await fs.promises.writeFile(dataPath, JSON.stringify(students, null, 2), "utf-8");
}
export function addStudent(
  students: Student[],
  name: string,
  major: string
): Student[] {
  const nextId =
    students.length === 0 ? 1 : Math.max(...students.map((s) => s.id)) + 1;
  const newStudent: Student = { id: nextId, name, major };
  return [...students, newStudent];
}
