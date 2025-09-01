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

export interface DetailedMarksTableRow {
    subject: string;
    highestMarks: number;
    highestMarkGrade: string;
    studentMarks: number;
    studentGrade: string;
}

export interface OverallSubjectData {
    year: string;
    firstTerm: number;
    secondTerm: number;
    thirdTerm: number;
}

export interface ParentReportData {
    studentName: string;
    studentGrade: string;
    studentClass: string;
    studentMarksDetailedTable: DetailedMarksTableRow[];
    subjectWiseMarksPie: ParentSubjectPieData[];
    overallSubjectLineGraph: OverallSubjectData[];
    individualSubjectAverages: { [subjectName: string]: LineChartData[] };
}

export interface ChildDetails {
    studentId?: string;
    admissionNo?: string;
    studentName: string;
    grade: string;
    className: string;
}

// Helper function to transform backend data to detailed marks table
const transformToDetailedMarksTable = (
    highestMarksData: any[],
    marksAndGradesData: any[]
): DetailedMarksTableRow[] => {
    const result: DetailedMarksTableRow[] = [];

    // Create a map for student marks by subject
    const studentMarksMap = new Map();
    marksAndGradesData.forEach(item => {
        studentMarksMap.set(item.subject, {
            marks: item.marks,
            grade: item.marksGrade || item.grade
        });
    });

    // Combine highest marks with student marks
    highestMarksData.forEach(highestItem => {
        const studentData = studentMarksMap.get(highestItem.subject) || { marks: 0, grade: 'N/A' };

        result.push({
            subject: highestItem.subject,
            highestMarks: highestItem.marks,
            highestMarkGrade: highestItem.marksGrade || highestItem.grade,
            studentMarks: studentData.marks,
            studentGrade: studentData.grade
        });
    });

    return result;
};

// Helper function to transform subject yearly marks to line chart format
const transformSubjectYearlyMarks = (subjectYearlyMarks: any): { [subjectName: string]: LineChartData[] } => {
    const result: { [subjectName: string]: LineChartData[] } = {};

    Object.keys(subjectYearlyMarks).forEach(subject => {
        const yearlyData = subjectYearlyMarks[subject];
        if (Array.isArray(yearlyData)) {
            result[subject] = yearlyData.map((item: any) => ({
                x: item.year?.toString() || '',
                y: parseFloat(item.average_marks) || 0
            }));
        }
    });

    return result;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth Helper function
export const getAuthHeader = () => {
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

// API call to fetch parent report data
export const fetchParentReport = async (
    startDate: string,
    endDate: string,
    exam: string,
    month: string,
    studentAdmissionNo: string
): Promise<ParentReportData> => { 
    try {
        const studentResponse = await axios.get(`${API_BASE_URL}/api/user`, {
            ...getAuthHeader(),
        });

        const studentInfo = studentResponse.data?.parent_data?.student_info;
        const studentGrade = studentInfo?.grade || '';
        const studentClass = studentInfo?.class || '';

        // Convert empty/null values to "null" string for URL path
        const sanitizedStartDate = startDate ;
        const sanitizedEndDate = endDate;
        const sanitizedExam = exam ;
        const sanitizedMonth = month || 'null'; // This will now pass "null" as string when month is empty

        // Constructing the URL with the sanitized parameters
        const urlPath = `${API_BASE_URL}/api/parent-report-data/${sanitizedStartDate}/${sanitizedEndDate}/${sanitizedExam}/${sanitizedMonth}/${encodeURIComponent(studentGrade)}/${encodeURIComponent(studentClass)}`;

        // Changed parameter name from student_admission_no to admission_no
        const params: any = {
            admission_no: studentAdmissionNo,
        };

        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== "")
        );

        console.log('API Request params:', filteredParams);
        console.log('API URL:', urlPath);
        console.log('Student Grade:', studentGrade);
        console.log('Student Class:', studentClass);

        const response = await axios.get(urlPath, {
            ...getAuthHeader(),
            params: filteredParams,
            timeout: 10000,
        });

        console.log('API Response:', response.data);

        if (!response.data) {
            throw new Error('No data received from server');
        }

        // Transform the response data to match expected structure
        const reportData: ParentReportData = {
            studentName: response.data.studentName || response.data.student_name || '',
            studentGrade: response.data.studentGrade || response.data.student_grade || '',
            studentClass: response.data.studentClass || response.data.student_class || '',

            // Transform highest_marks_per_subject and marks_and_grades into studentMarksDetailedTable
            studentMarksDetailedTable: transformToDetailedMarksTable(
                response.data.highest_marks_per_subject || [],
                response.data.marks_and_grades || []
            ),

            // Transform subject_marks to pie chart data
            subjectWiseMarksPie: (response.data.subject_marks || []).map((item: any) => ({
                name: item.subject,
                value: item.percentage || item.marks || 0
            })),

            // Transform yearly_term_averages to bar chart data
            overallSubjectLineGraph: (response.data.yearly_term_averages || []).map((item: any) => ({
                year: item.year?.toString() || '',
                firstTerm: item.terms?.find((t: any) => t.term === 'First')?.average_marks || 0,
                secondTerm: item.terms?.find((t: any) => t.term === 'Mid')?.average_marks || 0,
                thirdTerm: item.terms?.find((t: any) => t.term === 'End')?.average_marks || 0,
            })),

            // Transform subject_yearly_marks to individual subject averages
            individualSubjectAverages: transformSubjectYearlyMarks(response.data.subject_yearly_marks || {}),
        };

        return reportData;

    } catch (error) {
        console.error('API Error:', error);

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                throw new Error('Session expired. Please login again.');
            } else if (error.response?.status === 403) {
                throw new Error('Access denied. You do not have permission to view this data.');
            } else if (error.response?.status === 404) {
                throw new Error('No report data found for the selected criteria.');
            } else if (error.response?.status === 400) {
                throw new Error('Invalid request parameters. Please check your selection.');
            } else {
                throw new Error(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    `Request failed with status ${error.response?.status}`
                );
            }
        } else if (error instanceof Error) {
            throw error;
        }

        throw new Error("Network error or unknown error occurred");
    }
};

// API call to fetch child details
export const fetchChildDetails = async (): Promise<ChildDetails> => {
    try {
        const authHeader = getAuthHeader();
        const response = await axios.get(`${API_BASE_URL}/api/user`, {
            headers: authHeader.headers,
        });

        // Extract from parent_data based on your provided structure
        const parentData = response.data?.parent_data;
        const studentInfo = parentData?.student_info;
        const parentInfo = parentData?.parent_info;

        if (!studentInfo || !studentInfo.name || !studentInfo.grade || !studentInfo.class) {
            throw new Error("Student details not found in API response.");
        }

        const transformedData: ChildDetails = {
            studentName: studentInfo.name,
            grade: studentInfo.grade,
            className: studentInfo.class,
            admissionNo: parentInfo?.studentAdmissionNo || '',
        };

        return transformedData;
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