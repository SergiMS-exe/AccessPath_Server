import { PaginationParams } from "../interfaces/Pagination";

/**
 * Middleware para extraer y validar parámetros de paginación de la query
 */
export const extractPaginationParams = (query: any): PaginationParams => {
    return {
        page: query.page ? parseInt(query.page as string, 10) : 1,
        limit: query.limit ? parseInt(query.limit as string, 10) : 10
    };
};