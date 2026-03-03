export type SortDirection = "asc" | "desc" | "none";
export type ResponseFormat = "compact" | "default";
export type DateRangeValue = string | [string, string];

export type ExecuteQueryFilter = {
    member: string;
    operator: string;
    values: string[];
};

export type ExecuteQueryOrder = {
    member: string;
    direction: SortDirection;
};

export type ExecuteQueryTimeDimension = {
    dimension: string;
    granularity?: string;
    dateRange?: DateRangeValue;
    compareDateRange?: DateRangeValue[];
};

export type ExecuteQueryArgs = {
    entity_name: string;
    measures?: string[];
    dimensions?: string[];
    filters?: ExecuteQueryFilter[];
    timeDimensions?: ExecuteQueryTimeDimension[];
    segments?: string[];
    limit?: number;
    rowLimit?: number;
    offset?: number;
    order?: ExecuteQueryOrder[];
    timezone?: string;
    renewQuery?: boolean;
    ungrouped?: boolean;
    responseFormat?: ResponseFormat;
    total?: boolean;
};

export function buildCubeQuery(args: ExecuteQueryArgs) {
    const {
        measures,
        dimensions = [],
        filters = [],
        timeDimensions = [],
        segments = [],
        limit,
        rowLimit,
        offset,
        order = [],
        timezone,
        renewQuery,
        ungrouped,
        responseFormat,
        total
    } = args;

    const query: {
        measures?: string[];
        dimensions?: string[];
        filters?: ExecuteQueryFilter[];
        timeDimensions?: ExecuteQueryTimeDimension[];
        segments?: string[];
        limit?: number;
        rowLimit?: number;
        offset?: number;
        order?: Array<[string, SortDirection]>;
        timezone?: string;
        renewQuery?: boolean;
        ungrouped?: boolean;
        responseFormat?: ResponseFormat;
        total?: boolean;
    } = {};

    if (measures && measures.length > 0) {
        query.measures = [...measures];
    }

    if (dimensions.length > 0) {
        query.dimensions = [...dimensions];
    }

    if (filters.length > 0) {
        query.filters = filters.map((filter) => ({
            member: filter.member,
            operator: filter.operator,
            values: filter.values.map((value) => String(value))
        }));
    }

    if (limit !== undefined && limit !== null) {
        query.limit = limit;
    }

    if (timeDimensions.length > 0) {
        query.timeDimensions = timeDimensions.map((timeDimension) => ({
            ...timeDimension
        }));
    }

    if (segments.length > 0) {
        query.segments = [...segments];
    }

    if (rowLimit !== undefined && rowLimit !== null) {
        query.rowLimit = rowLimit;
    }

    if (offset !== undefined && offset !== null) {
        query.offset = offset;
    }

    if (order.length > 0) {
        query.order = order.map(({ member, direction }) => {
            const normalizedDirection = String(direction).toLowerCase() as SortDirection;

            if (!["asc", "desc", "none"].includes(normalizedDirection)) {
                throw new Error(`Invalid sort direction: ${direction}`);
            }

            return [member, normalizedDirection];
        });
    }

    if (timezone !== undefined) {
        query.timezone = timezone;
    }

    if (renewQuery !== undefined) {
        query.renewQuery = renewQuery;
    }

    if (ungrouped !== undefined) {
        query.ungrouped = ungrouped;
    }

    if (responseFormat !== undefined) {
        if (!["compact", "default"].includes(responseFormat)) {
            throw new Error(`Invalid responseFormat: ${responseFormat}`);
        }

        query.responseFormat = responseFormat;
    }

    if (total !== undefined) {
        query.total = total;
    }

    return query;
}
