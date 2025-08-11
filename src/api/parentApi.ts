import axios from "axios";

// A more generic interface for line chart data
export interface LineChartData {
  x: string;
  y: number;
}

export interface ParentSubjectPieData {
  name: string;
  value: number;
}

// This interface is for the detailed marks table row
// It includes data for both the student and the highest-scoring student in the class
export interface DetailedMarksTableRow {
  subject: string;
  studentMarks: number;
  studentGrade: string;
  highestMarks: number;
  highestMarkGrade: string;
}

// Data structure for the previous simple marks table
export interface StudentMarksData {
  subject: string;
  marks: number;
  grade: string;
}

// Data structure for individual subject average line graphs over time
// Using an index signature to make it dynamic
export interface IndividualSubjectAverageData {
  [subjectName: string]: LineChartData[] | undefined;
}

export interface ParentReportData {
  studentName: string;
  studentGrade: string;
  studentClass: string;
  subjectWiseMarksPie: ParentSubjectPieData[];
  overallSubjectLineGraph: LineChartData[];
  individualSubjectAverages: IndividualSubjectAverageData;
  // Updated to use the new, more detailed interface for the table
  studentMarksDetailedTable: DetailedMarksTableRow[];
}

export const fetchParentReport = async (
  studentId: string, year: string, exam: string, month: string): Promise<ParentReportData> => {
  // The fix is here: 'month' is now included in the params object.
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/parent-report/${studentId}`, {
    params: { year, exam, month }, // <-- The 'month' parameter is now used
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      Accept: 'application/json',
    },
  });

  if (!response.data) throw new Error("No data received from server");
  return response.data;
};

export interface ChildDetails {
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
}

export const fetchChildDetails = async (): Promise<ChildDetails> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/parent/child-details`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      Accept: 'application/json',
    },
  });

  if (!response.data) throw new Error("No child details received from server");
  return response.data;
};
