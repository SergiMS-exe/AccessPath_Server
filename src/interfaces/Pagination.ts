export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetadata;
}