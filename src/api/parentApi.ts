import axios from "axios";

export interface ParentSubjectPieData {
  name: string;
  value: number;
}

export interface ParentLineChartData {
  x: string; // e.g., "2021", "2022 Term 1"
  y: number; // The average mark for that period
}

export interface StudentMarksData {
  subject: string;
  marks: number;
  grade: string;
}

// Data structure for overall subject performance (like the top left chart in the screenshot)
export interface OverallSubjectLineGraphData {
  x: string; // e.g., "Term 1", "Term 2", "Term 3" or "2021", "2022"
  y: number; // Overall average mark for the student for that period
}

// Data structure for individual subject average line graphs over time
export interface IndividualSubjectAverageData {
  English?: ParentLineChartData[]; // Array of {x: period, y: averageMark}
  Sinhala?: ParentLineChartData[];
  Maths?: ParentLineChartData[];
  Science?: ParentLineChartData[];
  History?: ParentLineChartData[];
  Geography?: ParentLineChartData[];
  Buddhism?: ParentLineChartData[];
  Art?: ParentLineChartData[];
  EnglishLit?: ParentLineChartData[];
  // Add any other subjects your system has
}

export interface ParentReportData {
  studentName: string;
  studentGrade: string;
  studentClass: string;
  subjectWiseMarksPie: ParentSubjectPieData[]; // For the current exam's subject distribution (Subject wise marks)
  overallSubjectLineGraph: OverallSubjectLineGraphData[]; // For the overall performance over time (Overall Subject)
  individualSubjectAverages: IndividualSubjectAverageData; // New: For each subject's average trend over time
  studentMarksDetailedTable: StudentMarksData[]; // Renamed for clarity: marks for individual subjects for the selected exam
}

export const fetchParentReport = async (
  studentId: string,
  year: string, // This 'year' will primarily filter the detailed table and pie chart for a specific exam
  exam: string
): Promise<ParentReportData> => {
  // IMPORTANT: The backend API must be updated to provide ALL these data points.
  // - overallSubjectLineGraph: historical overall averages for the student
  // - individualSubjectAverages: historical averages for each subject for the student
  // - subjectWiseMarksPie: subject marks for the selected 'year' and 'exam'
  // - studentMarksDetailedTable: detailed marks for the selected 'year' and 'exam'
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/parent-report/${studentId}`, {
    params: { year, exam },
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