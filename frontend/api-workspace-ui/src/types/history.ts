// src/types/history.ts


// ==========================================
// Execution History
// ==========================================

export interface HistoryResponse {

    id: number;

    statusCode: number;

    responseTime: number;

    executedAt: string;

    responseBody: string | null;
}