import { t } from "elysia";

import { FormatRegistry } from "elysia/type-system";
import { IsDateTime } from "../format";

FormatRegistry.Set("date-time", (value) => IsDateTime(value));
export const IsoDate = t
    .Transform(t.String({ format: "date-time" }))
    .Decode((value) => new Date(value))
    .Encode((value) => value.toISOString());
