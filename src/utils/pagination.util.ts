
import { Model, FilterQuery } from 'mongoose';
import { PaginationParams, PaginatedResponse, PaginationMetadata } from '../interfaces/Pagination';

/**
 * Función genérica para paginar consultas de Mongoose
 */
export const paginateQuery = async <T>(
    model: Model<T>,
    filter: FilterQuery<T> = {},
    options: PaginationParams & {
        sort?: any;
        select?: string;
        populate?: string | any;
    } = {}
): Promise<PaginatedResponse<T>> => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10)); // límite máximo de 100
    const skip = (page - 1) * limit;

    // Ejecutar consulta y contar en paralelo para mejor rendimiento
    const [data, totalItems] = await Promise.all([
        model
            .find(filter)
            .sort(options.sort || { createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(options.select || '')
            .populate(options.populate || '')
            .lean() as Promise<T[]>,
        model.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    return { data, pagination };
};

/**
 * Función para paginar arrays (útil cuando ya tienes los datos en memoria)
 */
export const paginateArray = <T>(
    array: T[],
    options: PaginationParams = {}
): PaginatedResponse<T> => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const data = array.slice(skip, skip + limit);
    const totalItems = array.length;
    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    return { data, pagination };
};
