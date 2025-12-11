// Part 3

type Student = {
  id: number;
  name: string;
  grade: number;
  isActive: boolean;
};
const studentsJson = `[
    { "id": 1, "name": "Ann", "grade": 3.5, "isActive": true },
    { "id": 2, "name": "Bob", "grade": 2.7, "isActive": false },
    { "id": 3, "name": "Chen", "grade": 3.9, "isActive": true },
    { "id": 4, "name": "Dai", "grade": 1.9, "isActive": true },
    { "id": 5, "name": "Eve", "isActive": false }
]`;
// Parse JSON to Object
const students: Student[] = JSON.parse(studentsJson);
function getActiveStudents(students: Student[]): Student[] {
  return students.filter((s) => s.isActive);
}
function calculateAverageGrade(students: Student[]): number {
  if (students.length === 0) return 0;
  const total = students.reduce((sum, s) => sum + s.grade, 0);
  return total / students.length;
}
console.log("Students from JSON:", students);
console.log("Active students:", getActiveStudents(students));
console.log("Average grade:", calculateAverageGrade(students));
// Convert Object to JSON
const activeStudentsJson = JSON.stringify(getActiveStudents(students), null, 2);
console.log("Active students JSON:\n", activeStudentsJson);
