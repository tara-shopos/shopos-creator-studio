import { z } from 'zod/v4';

// Use `any` for internal def access since Zod v4 types the base def
// narrowly — we need to access type-specific fields like .left, .right, .shape, etc.
type ZodDef = any;

function getDef(schema: z.ZodTypeAny): ZodDef | null {
    return (schema as any)?._zod?.def ?? null;
}

/**
 * Recursively walks a Zod v4 schema tree and replaces ZodIntersection
 * nodes with merged ZodObject schemas. This fixes compatibility with
 * Anthropic's Claude API, which doesn't support ZodIntersection.
 */
function flattenZodSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
    const def = getDef(schema);
    if (!def) return schema;

    switch (def.type) {
        case 'intersection': {
            const leaves = collectIntersectionLeaves(schema);
            const flatLeaves = leaves.map(flattenZodSchema);

            // Separate object leaves from non-object leaves
            const objectLeaves: z.ZodTypeAny[] = [];
            const otherLeaves: z.ZodTypeAny[] = [];
            for (const leaf of flatLeaves) {
                const leafDef = getDef(leaf);
                if (leafDef?.type === 'object') {
                    objectLeaves.push(leaf);
                } else {
                    otherLeaves.push(leaf);
                }
            }

            // Merge all object shapes into one
            let merged: z.ZodTypeAny | null = null;
            if (objectLeaves.length > 0) {
                const mergedShape: Record<string, z.ZodTypeAny> = {};
                for (const obj of objectLeaves) {
                    const objDef = getDef(obj);
                    if (objDef?.shape) {
                        for (const [key, value] of Object.entries(
                            objDef.shape as Record<string, z.ZodTypeAny>
                        )) {
                            mergedShape[key] = value;
                        }
                    }
                }
                merged = z.object(mergedShape);
            }

            // If there are no non-object leaves, just return the merged object
            if (otherLeaves.length === 0 && merged) {
                return merged;
            }

            // If there are only non-object leaves, return a passthrough object
            // (best effort — intersection of non-objects is hard to flatten)
            if (!merged && otherLeaves.length > 0) {
                return otherLeaves[0];
            }

            // Mixed: merged object + other leaves
            // Use a passthrough object that includes the merged shape
            // This is the best we can do without intersection
            if (merged) {
                return merged;
            }

            return schema;
        }

        case 'object': {
            if (!def.shape) return schema;
            const newShape: Record<string, z.ZodTypeAny> = {};
            let changed = false;
            for (const [key, value] of Object.entries(
                def.shape as Record<string, z.ZodTypeAny>
            )) {
                const flattened = flattenZodSchema(value);
                newShape[key] = flattened;
                if (flattened !== value) changed = true;
            }
            return changed ? z.object(newShape) : schema;
        }

        case 'array': {
            if (!def.element) return schema;
            const flatElement = flattenZodSchema(def.element);
            return flatElement !== def.element
                ? z.array(flatElement)
                : schema;
        }

        case 'optional':
        case 'exactOptional': {
            if (!def.innerType) return schema;
            const flatInner = flattenZodSchema(def.innerType);
            return flatInner !== def.innerType
                ? z.optional(flatInner)
                : schema;
        }

        case 'nullable': {
            if (!def.innerType) return schema;
            const flatInner = flattenZodSchema(def.innerType);
            return flatInner !== def.innerType
                ? z.nullable(flatInner)
                : schema;
        }

        case 'union': {
            if (!def.options) return schema;
            let changed = false;
            const newOptions = (def.options as z.ZodTypeAny[]).map(
                (opt: z.ZodTypeAny) => {
                    const flat = flattenZodSchema(opt);
                    if (flat !== opt) changed = true;
                    return flat;
                }
            );
            if (!changed) return schema;
            if (newOptions.length >= 2) {
                return z.union(
                    newOptions as [
                        z.ZodTypeAny,
                        z.ZodTypeAny,
                        ...z.ZodTypeAny[],
                    ]
                );
            }
            return newOptions[0] ?? schema;
        }

        case 'tuple': {
            if (!def.items) return schema;
            let changed = false;
            const newItems = (def.items as z.ZodTypeAny[]).map(
                (item: z.ZodTypeAny) => {
                    const flat = flattenZodSchema(item);
                    if (flat !== item) changed = true;
                    return flat;
                }
            );
            return changed
                ? z.tuple(newItems as [z.ZodTypeAny, ...z.ZodTypeAny[]])
                : schema;
        }

        default:
            return schema;
    }
}

/**
 * Recursively collects leaf schemas from a nested ZodIntersection tree.
 * e.g. intersection(intersection(A, B), C) → [A, B, C]
 */
function collectIntersectionLeaves(schema: z.ZodTypeAny): z.ZodTypeAny[] {
    const def = getDef(schema);
    if (!def || def.type !== 'intersection') {
        return [schema];
    }
    return [
        ...collectIntersectionLeaves(def.left),
        ...collectIntersectionLeaves(def.right),
    ];
}

/**
 * Takes MCP tools (from `mcp.listTools()`) and returns new tools with
 * flattened input schemas that don't contain ZodIntersection types.
 * This fixes compatibility with Anthropic's Claude API.
 */
export function flattenMcpToolSchemas<T extends Record<string, any>>(
    tools: T
): T {
    const result: any = {};

    for (const [name, tool] of Object.entries(tools)) {
        if (!tool?.inputSchema) {
            result[name] = tool;
            continue;
        }

        try {
            const flattened = flattenZodSchema(tool.inputSchema);
            result[name] = {
                ...tool,
                inputSchema: flattened,
            };
        } catch (e) {
            console.warn(`Failed to flatten schema for tool "${name}":`, e);
            result[name] = tool;
        }
    }

    return result as T;
}
