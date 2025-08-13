// src/api/addmarksApi.ts

import axios from 'axios';

// Get the API base URL from environment variables
// VITE_API_BASE_URL (for Vite) or REACT_APP_API_BASE_URL (for Create React App)
// Make sure this URL is EXACTLY what your backend root is, ending before /marks
// For example: if your actual backend root is 'https://s1.perahara.lk/smart_school_backend/public'
// Then the API_BASE_URL should be that.
// We then append '/marks' in the fetchStudentMarks function.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

// Helper function to get the authorization header
const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '', // Ensure token exists
            'Content-Type': 'application/json',
        },
    };
};

// Define the type for the marks data that will be fetched and sent
export interface StudentMark {
    id: number;
    student_admission: string;
    student_name: string;
    student_grade: string;
    student_class: string; // Assuming class is part of the student data from backend
    subject: string;
    term: string;
    marks: string; // Assuming marks can be an empty string or a number string
    // If your backend also returns 'month' as part of the StudentMark object,
    // you should add it here as well:
    // month?: string;
}

/**
 * Defines the shape of the filters object for fetching student marks.
 * Added 'month' as an optional string property.
 */
interface FetchMarksFilters {
    grade?: string;
    class?: string;
    subject?: string;
    term?: string;
    month?: string; // <--- ADDED THIS LINE
    searchQuery?: string;
}

/**
 * Fetches student marks data from the backend based on filters.
 * @param filters - An object containing grade, class, subject, term, month, and searchQuery.
 * @returns A promise that resolves to an array of StudentMark.
 */
export const fetchStudentMarks = async (filters: FetchMarksFilters): Promise<StudentMark[]> => {
    try {
        // Corrected URL: Ensure no double slashes // after API_BASE_URL
        // If API_BASE_URL already ends with /public, then just '/marks' is enough.
        const response = await axios.get(`${API_BASE_URL}/api/add-marks`, {
            ...getAuthHeader(),
            params: {
                grade: filters.grade || '',
                class: filters.class || '',
                subject: filters.subject || '',
                term: filters.term || '',
                month: filters.month || '', 
                search: filters.searchQuery || '',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching student marks:', error);
        throw error;
    }
};

/**
 * Submits (updates) an array of student marks to the backend.
 * @param marksToSubmit - An array of StudentMark objects to be updated.
 * @returns A promise that resolves when the update is successful.
 */
export const submitStudentMarks = async (marksToSubmit: Partial<StudentMark>[]): Promise<void> => {
    try {
        // Corrected URL: Ensure no double slashes //
        await axios.post(`${API_BASE_URL}/marks/update`, marksToSubmit, getAuthHeader());
        console.log('Marks submitted successfully!');
    } catch (error) {
        console.error('Error submitting marks:', error);
        throw error;
    }
};