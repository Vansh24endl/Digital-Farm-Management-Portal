
const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("farmdrishti_token") : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(
            `Non-JSON response from ${endpoint} (${response.status}). Check VITE_API_URL and backend status.`
        );
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "API request failed");
    }

    return result as T;
}

// ─── Shared types ──────────────────────────────────────────────────────────────

export type DashboardStats = {
    success: boolean;
    data: {
        totalFarms: number;
        totalVisitors: number;
        totalAudits: number;
        pendingAudits: number;
        totalDiseaseReports: number;
        activeDiseaseReports: number;
        totalInventoryItems: number;
        lowStockItems: number;
    };
};

export type ChecklistSummary = {
    totalSubmissions: number;
    totalItems: number;
    passed: number;
    warning: number;
    critical: number;
    compliancePercentage: number;
};

export type RecentChecklistActivity = {
    _id: string;
    farmName: string;
    zone: string;
    submittedAt: string;
    summary: {
        total: number;
        passed: number;
        warning: number;
        critical: number;
    };
};

export type DashboardSummary = {
    success: boolean;
    data: DashboardStats["data"] & {
        checklistSummary: ChecklistSummary;
        recentChecklistActivity: RecentChecklistActivity[];
    };
};

export type User = {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: "admin" | "farm_manager" | "inspector" | "veterinarian";
    farmId?: any;
    phone?: string;
    isActive?: boolean;
};

export type AuthResponse = {
    success: boolean;
    message: string;
    token: string;
    user: User;
};

// ─── API client ────────────────────────────────────────────────────────────────

export const api = {
    /** Legacy endpoint — kept for backwards compatibility with existing code. */
    getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

    /**
     * Comprehensive dashboard summary that includes checklist aggregations.
     * Prefer this over getDashboardStats in new code.
     */
    getDashboardSummary: () => request<DashboardSummary>("/dashboard/summary"),

    getFarms: () => request<any>("/farms"),

    getVisitors: () => request<any>("/visitors"),

    getAudits: () => request<any>("/audits"),

    getDiseaseReports: () => request<any>("/disease-reports"),

    createDiseaseReport: (data: any) =>
        request<{ success: boolean; data: any }>("/disease-reports", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getInventory: () => request<any>("/inventory"),

    createAudit: (data: any) =>
        request<{ success: boolean; data: any }>("/audits", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateAudit: (id: string, data: any) =>
        request<{ success: boolean; data: any }>(`/audits/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    // Auth methods
    login: (credentials: { email: string; password: string }) =>
        request<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        }),

    register: (userData: {
        name: string;
        email: string;
        password: string;
        role?: string;
        farmId?: string;
        phone?: string;
    }) =>
        request<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        }),

    getCurrentUser: () => request<{ success: boolean; user: User }>("/auth/me"),

    updateProfile: (data: { name?: string; phone?: string }) =>
        request<{ success: boolean; message: string; user: User }>("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    getAllUsers: () =>
        request<{ success: boolean; count: number; users: User[] }>("/auth/users"),
};