// src/api/addmarksApi.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '', 
            'Content-Type': 'application/json',
        },
    };
};

export interface StudentMark {
    id: number;
    student_admission: string;
    student_name: string;
    student_grade: string;
    student_class: string;
    subject: string;
    term: string;
    marks: string;
    month?: string;
}

interface FetchMarksFilters {
    grade?: string;
    class?: string;
    subject?: string;
    term?: string;
    month?: string;
    searchQuery?: string;
}

export const fetchStudentMarks = async (filters: FetchMarksFilters): Promise<StudentMark[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/marks`, {
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

export const submitStudentMarks = async (marksToSubmit: Partial<StudentMark>[]): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/marks/update`, marksToSubmit, getAuthHeader());
        console.log('Marks submitted successfully!');
    } catch (error) {
        console.error('Error submitting marks:', error);
        throw error;
    }
};

export const fetchGradesFromApi = async (): Promise<{ label: string; value: string }[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}api/grades`, getAuthHeader());
        return response.data.map((item: any) => ({
          label: item.label,
          value: item.value, 
        }));
    } catch (error) {
        console.error('Error fetching grades:', error);
        throw error;
    }
};

export const fetchClassesFromApi = async (): Promise<{ label: string; value: string }[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}api/grade-classes`, getAuthHeader());
        
        return response.data.map((item: any) => ({
          label: item.label,
          value: item.value, 
        }));
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
    }
};