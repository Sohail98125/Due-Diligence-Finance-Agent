import axios from 'axios';

export const getStatus = async (jobId) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/status/${jobId}`,
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error("Status fetch failed:", error);
        throw error;
    }
}

export const getReport = async (jobId) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/report/${jobId}`,
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch report:", error);
        throw error;
    }
}

export const postAnalyze = async (query) => {
    const response = await axios.post('http://localhost:5000/api/analyze',
        {
            userRequest: query
        },
        {
            withCredentials: true
        }
    );
    return response.data;
}

export const getHistory = async () => {
    const response = await axios.get('http://localhost:5000/api/history',
        {
            withCredentials: true
        }
    );
    return response.data;
}

export const currentUser = async () => {
    try {
        const response = await axios.get(
            "http://localhost:5000/auth/me",
            {
                withCredentials: true
            }
        );

        return response.data;
    } catch (error) {
        // User login nahi hai — normal situation
        if (error.response?.status === 401) {
            return { user: null };
        }

        // Sirf doosri errors log karo
        console.error("Failed to check authentication:", error);
        throw error;
    }
};

export const logOutUser = async () => {
    const response = await axios.post(
        "http://localhost:5000/auth/logout",
        {},
        {
            withCredentials: true
        }
    );
    return response.data;
};