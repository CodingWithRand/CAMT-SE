import {
  loadStudents,
  saveStudents,
  addStudent,
} from "./services/studentService";
(async () => {
  const students = await loadStudents();
  const updated = addStudent(students, "Mina", "UX");
  await saveStudents(updated);
  console.log("Updated students:", updated);
})();