import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StudentSubjectMark {
  subject: string;
  marks: number;
}

interface StudentMark {
  studentName: string;
  subjects: StudentSubjectMark[];
  total_marks: number;
  average_marks: number;
  rank: number;
}

interface SubjectMark {
  subject: string;
  average_marks: number;
  percentage: number;
}

interface YearlySubjectAverage {
  year: number;
  subjects: SubjectMark[];
}

export interface ClassTeacherReportData {
  subject_marks: SubjectMark[];
  student_marks: StudentMark[];
  yearly_subject_averages: YearlySubjectAverage[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

export const fetchClassTeacherReport = async (
  startDate: string,
  endDate: string,
  grade: string,
  className: string,
  exam: string
): Promise<ClassTeacherReportData> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/teacher-report-data/${startDate}/${endDate}/${grade}/${className}/${exam}`,
      {
        ...getAuthHeader(),
        timeout: 10000,
      }
    );

    // Transform string numbers to actual numbers
    const transformMarks = (marks: any): number => {
      if (typeof marks === 'string') {
        return parseFloat(marks) || 0;
      }
      return marks || 0;
    };

    return {
      subject_marks: response.data.subject_marks?.map((sm: any) => ({
        subject: sm.subject,
        average_marks: transformMarks(sm.average_marks),
        percentage: transformMarks(sm.percentage)
      })) || [],
      student_marks: response.data.student_marks?.map((student: any) => ({
        studentName: student.studentName,
        subjects: student.subjects.map((subject: any) => ({
          subject: subject.subject,
          marks: transformMarks(subject.marks)
        })),
        total_marks: transformMarks(student.total_marks),
        average_marks: transformMarks(student.average_marks),
        rank: student.rank
      })) || [],
      yearly_subject_averages: response.data.yearly_subject_averages?.map((yearData: any) => ({
        year: yearData.year,
        subjects: yearData.subjects.map((subject: any) => ({
          subject: subject.subject,
          average_marks: transformMarks(subject.average_marks),
          percentage: transformMarks(subject.percentage)
        }))
      })) || []
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Request failed');
    }
    throw new Error("Network error occurred");
  }
};