export interface TableData {
    id: number;
    class_id?: string;
    grade_id?: string;
    school_id?: string;
    student_name: string;
    student_admission?: string;
    subject?: string;
    term?: string;
    marks?: string;
    class?: string;
    description?: string;
    student_grade?: string;
  }
  
  export const marks_table: TableData[] = [
    { id: 1, student_admission: "stid001", student_name: "Nicoly", subject: "Mathematics", term: "2nd Term", marks: "89", student_grade: "10" },
    { id: 2, student_admission: "stid002", student_name: "Frank", subject: "Mathematics", term: "2nd Term", marks: "98", student_grade: "10" },
    { id: 3, student_admission: "stid003", student_name: "Jcob", subject: "Mathematics", term: "2nd Term", marks: "75", student_grade: "5" },
    { id: 4, student_admission: "stid004", student_name: "Jane", subject: "Mathematics", term: "2nd Term", marks: "65", student_grade: "8" },
    { id: 5, student_admission: "stid005", student_name: "Alex", subject: "Mathematics", term: "2nd Term", marks: "85", student_grade: "7" },
  ];

export const class_table: TableData[] = [
    { id: 1, class:"10-B", student_name: "Nicoly", description:"Sample Text1", class_id: "cls010_B", grade_id: "10"},
    { id: 2, class:"10-B", student_name: "Nicoly", description:"Sample Text1", class_id: "cls010_B", grade_id: "10"},
    { id: 3, class:"10-B", student_name: "Nicoly", description:"Sample Text1", class_id: "cls010_B", grade_id: "10"},
    { id: 4, class:"10-B", student_name: "Nicoly", description:"Sample Text1", class_id: "cls010_B", grade_id: "10"},
    { id: 5, class:"10-B", student_name: "Nicoly", description:"Sample Text1", class_id: "cls010_B", grade_id: "10"},
  ];