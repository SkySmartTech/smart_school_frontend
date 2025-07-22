// StudentDashboard.tsx
import React from 'react';
// Import the newly created reusable components
import StudentInfoSection from '../../components/Studentspage_Components/StudentInfoSection';
import RecentExamCard from '../../components/Studentspage_Components/RecentExamCard';
import RemarksCard from '../../components/Studentspage_Components/RemarksCard';
import MarksTable from '../../components/Studentspage_Components/MarksTable';
import PerformanceChart from '../../components/Studentspage_Components/PerformanceChart';

// Define the interface for the student data structure
interface StudentData {
  name: string;
  grade: string;
  average: number;
  classPosition: number;
  marks: {
    subject: string;
    term1: number;
    term2: number;
    term3: number;
  }[];
  performanceData: {
    term: string;
    marks: number;
  }[];
  recentExam: string;
  remarks: string;
}

/**
 * StudentDashboard component serves as the main container for displaying a student's academic information.
 * It integrates various smaller, reusable components to present a comprehensive view of grades,
 * performance, and remarks.
 *
 * This component handles the main data structure and passes relevant slices of data
 * and helper functions down to its child components.
 *
 * @returns {JSX.Element} A React component rendering the complete student dashboard.
 */
const StudentDashboard: React.FC = () => {
  // Sample student data. In a real application, this would likely come from an API or context.
  const studentData: StudentData = {
    name: "Bimsara",
    grade: "Grade 8",
    average: 85.5,
    classPosition: 3,
    marks: [
      { subject: "English", term1: 88, term2: 92, term3: 85 },
      { subject: "Mathematics", term1: 82, term2: 85, term3: 89 },
      { subject: "Science", term1: 90, term2: 88, term3: 92 },
      { subject: "History", term1: 78, term2: 82, term3: 80 },
      { subject: "Geography", term1: 85, term2: 87, term3: 84 }
    ],
    performanceData: [
      { term: "Term 1", marks: 84.6 },
      { term: "Term 2", marks: 86.8 },
      { term: "Term 3", marks: 86.0 }
    ],
    recentExam: "Mathematics Unit Test - 89%",
    remarks: "Good Progress"
  };

  /**
   * Determines the Tailwind CSS background color class based on the remark string.
   * This function is kept here as it's a utility for the remarks display.
   * @param {string} remark - The remark string.
   * @returns {string} Tailwind CSS background color class.
   */
  const getRemarkColor = (remark: string): string => {
    const lowerRemark = remark.toLowerCase();
    if (lowerRemark.includes('excellent') || lowerRemark.includes('outstanding')) return 'bg-green-500';
    if (lowerRemark.includes('good') || lowerRemark.includes('progress')) return 'bg-green-400';
    if (lowerRemark.includes('average') || lowerRemark.includes('satisfactory')) return 'bg-yellow-500';
    if (lowerRemark.includes('poor') || lowerRemark.includes('needs improvement')) return 'bg-red-500';
    return 'bg-blue-400'; // Default color
  };

  /**
   * Determines the Tailwind CSS text color and font weight class based on a numerical grade.
   * This function is kept here as it's a utility for displaying grades in the table.
   * @param {number} grade - The numerical grade.
   * @returns {string} Tailwind CSS text color and font weight class.
   */
  const getGradeColor = (grade: number): string => {
    if (grade >= 90) return 'text-green-600 font-semibold';
    if (grade >= 80) return 'text-blue-600 font-semibold';
    if (grade >= 70) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Dashboard</h1>
          <div className="h-1 w-20 bg-blue-500 rounded"></div>
        </header>

        {/* Main content grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Student Info and Quick Stats */}
          <div className="space-y-6">
            {/* Student Information Section */}
            <StudentInfoSection
              name={studentData.name}
              grade={studentData.grade}
              average={studentData.average}
              classPosition={studentData.classPosition}
            />

            {/* Recent Exam Card */}
            <RecentExamCard recentExam={studentData.recentExam} />

            {/* Remarks Card */}
            <RemarksCard remarks={studentData.remarks} getRemarkColor={getRemarkColor} />
          </div>

          {/* Center Panel - Marks Table */}
          <MarksTable marks={studentData.marks} getGradeColor={getGradeColor} />

          {/* Right Panel - Performance Chart and Summary */}
          <PerformanceChart performanceData={studentData.performanceData} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
