// classteacherApi.ts
import axios from "axios";

export interface SubjectPieData {
  name: string;
  value: number;
}

export interface LineChartData {
  x: number;
  y: number;
}

export interface StudentMarksData {
  name: string;
  marks: number;
}

export interface ClassTableRow {
  class: string;
  sinhala: number;
  english: number;
  maths: number;
}

export interface ClassTeacherReportData {
  subjectPie: SubjectPieData[];
  lineGraph: LineChartData[];
  studentMarks: StudentMarksData[];
  classTable: ClassTableRow[];
}

export const fetchClassTeacherReport = async (
  year: string,
  grade: string,
  className: string,
  exam: string
): Promise<ClassTeacherReportData> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/class-teacher-report`, {
    params: { year, grade, className, exam },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      Accept: 'application/json',
    },
  });

  if (!response.data) throw new Error("No data received from server");
  return response.data;
};
