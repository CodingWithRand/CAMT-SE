import * as fs from "fs";

type Student = {
  id: number;
  name: string;
  grade: number;
  isActive: boolean;
};

const raw = fs.readFileSync("data/students.json", "utf-8");
const students: Student[] = JSON.parse(raw);

const topStudents = students.filter((s) => s.grade >= 3.0);
console.log("Top students:", topStudents);
const topJson = JSON.stringify(topStudents, null, 2);
fs.writeFileSync("data/top-students.json", topJson);

console.log("top-students.json written!");
