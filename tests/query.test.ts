import { buildCubeQuery } from '../src/query';

describe('buildCubeQuery', () => {
    it('maps order rules to Cube tuple order format', () => {
        const query = buildCubeQuery({
            entity_name: 'Components',
            measures: ['Components.count'],
            dimensions: ['Components.id'],
            order: [
                { member: 'Components.count', direction: 'desc' },
                { member: 'Components.id', direction: 'asc' }
            ]
        });

        expect(query.order).toEqual([
            ['Components.count', 'desc'],
            ['Components.id', 'asc']
        ]);
    });

    it('stringifies filter values before sending to Cube', () => {
        const query = buildCubeQuery({
            entity_name: 'Components',
            measures: ['Components.count'],
            filters: [
                {
                    member: 'Components.id',
                    operator: 'equals',
                    values: ['123', 456 as unknown as string]
                }
            ]
        });

        expect(query.filters).toEqual([
            {
                member: 'Components.id',
                operator: 'equals',
                values: ['123', '456']
            }
        ]);
    });

    it('rejects invalid sort directions', () => {
        expect(() => buildCubeQuery({
            entity_name: 'Components',
            measures: ['Components.count'],
            order: [
                { member: 'Components.count', direction: 'descending' as never }
            ]
        })).toThrow('Invalid sort direction: descending');
    });

    it('allows dimensions-only queries without measures', () => {
        const query = buildCubeQuery({
            entity_name: 'Components',
            dimensions: ['Components.id']
        });

        expect(query.measures).toBeUndefined();
        expect(query.dimensions).toEqual(['Components.id']);
    });

    it('passes through additional Cube query parameters', () => {
        const query = buildCubeQuery({
            entity_name: 'Orders',
            measures: ['Orders.count'],
            timeDimensions: [
                {
                    dimension: 'Orders.createdAt',
                    granularity: 'day',
                    dateRange: ['2026-01-01', '2026-01-31'],
                    compareDateRange: [
                        ['2025-12-01', '2025-12-31'],
                        'last 30 days'
                    ]
                }
            ],
            segments: ['Orders.completed'],
            limit: 100,
            rowLimit: 500,
            offset: 20,
            timezone: 'UTC',
            renewQuery: true,
            ungrouped: false,
            responseFormat: 'compact',
            total: true
        });

        expect(query.timeDimensions).toEqual([
            {
                dimension: 'Orders.createdAt',
                granularity: 'day',
                dateRange: ['2026-01-01', '2026-01-31'],
                compareDateRange: [
                    ['2025-12-01', '2025-12-31'],
                    'last 30 days'
                ]
            }
        ]);
        expect(query.segments).toEqual(['Orders.completed']);
        expect(query.limit).toBe(100);
        expect(query.rowLimit).toBe(500);
        expect(query.offset).toBe(20);
        expect(query.timezone).toBe('UTC');
        expect(query.renewQuery).toBe(true);
        expect(query.ungrouped).toBe(false);
        expect(query.responseFormat).toBe('compact');
        expect(query.total).toBe(true);
    });

    it('rejects invalid response formats', () => {
        expect(() => buildCubeQuery({
            entity_name: 'Orders',
            measures: ['Orders.count'],
            responseFormat: 'json' as never
        })).toThrow('Invalid responseFormat: json');
    });
});
