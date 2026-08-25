// src/types/execution.ts

// ==========================================
// Response Headers
// ==========================================

export interface ExecutionResponseHeaders {
    [key: string]: string;
}


// ==========================================
// API Execution Response
// ==========================================

export interface ExecutionResponse {

    // HTTP status code
    status: number;

    // HTTP status text
    // Example: "OK", "Not Found"
    statusText: string;

    // Response headers
    headers: Record<string, string[]>;

    // Raw response body
    body: string;

    // Time taken by the target API
    // in milliseconds
    responseTime: number;

    // Approximate response size
    // in bytes
    size: number;
}


// ==========================================
// API Execution Error
// ==========================================

export interface ExecutionError {

    // Error message to display
    message: string;

    // Optional HTTP status
    // Useful when backend returns an HTTP error
    status?: number;

    // Optional backend error details
    details?: string;
}