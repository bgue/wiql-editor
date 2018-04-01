import { FieldType } from "TFS/WorkItemTracking/Contracts";
import * as Symbols from "./symbols";
import { ITokenPattern } from "./tokenizer";

export const wiqlPatterns: ITokenPattern[] = [
    { match: /[ \r\t\n]+/ },
    { match: "SELECT", token: Symbols.Select },
    { match: "FROM", token: Symbols.From },
    { match: "WHERE", token: Symbols.Where },
    { match: "ORDER BY", token: Symbols.OrderBy },
    { match: "ASC", token: Symbols.Asc },
    { match: "DESC", token: Symbols.Desc },
    { match: "ASOF", token: Symbols.Asof },
    { match: "NOT", token: Symbols.Not },
    { match: "EVER", token: Symbols.Ever },
    { match: "IN", token: Symbols.In },
    { match: "LIKE", token: Symbols.Like },
    { match: "UNDER", token: Symbols.Under },
    { match: "workitems", token: Symbols.WorkItems },
    { match: "workitemlinks", token: Symbols.WorkItemLinks },
    { match: "AND", token: Symbols.And },
    { match: "OR", token: Symbols.Or },
    { match: "CONTAINS", token: Symbols.Contains },
    { match: "WORDS", token: Symbols.Words },
    { match: "GROUP", token: Symbols.Group },
    { match: "true", token: Symbols.True, valueTypes: [FieldType.Boolean] },
    { match: "false", token: Symbols.False, valueTypes: [FieldType.Boolean] },
    { match: "MODE", token: Symbols.Mode },
    { match: "MustContain", token: Symbols.MustContain },
    { match: "MayContain", token: Symbols.MayContain },
    { match: "DoesNotContain", token: Symbols.DoesNotContain },
    { match: "Recursive", token: Symbols.Recursive },
    { match: "ReturnMatchingChildren", token: Symbols.ReturnMatchingChildren },
    { match: "Source", token: Symbols.Source },
    { match: "Target", token: Symbols.Target },
    { match: ".", token: Symbols.Dot },
    { match: "(", token: Symbols.LParen },
    { match: ")", token: Symbols.RParen },
    { match: "[any]", token: Symbols.Variable },
    { match: /@\w*/, token: Symbols.Variable },
    {
        match: "[",
        token: Symbols.LSqBracket,
        pushState: [
            { match: /source(?=])/, token: Symbols.Source},
            { match: /target(?=])/, token: Symbols.Target},
            { match: /[^\]]+/, token: Symbols.Identifier },
            { match: /]/, token: Symbols.RSqBracket, popState: true },
        ],
    },
    { match: /[a-z_][\w\.]*/, token: Symbols.Identifier },
    { match: "]", token: Symbols.RSqBracket },
    { match: ",", token: Symbols.Comma },
    { match: "=", token: Symbols.Equals },
    { match: "<>", token: Symbols.NotEquals },
    { match: ">=", token: Symbols.GreaterOrEq },
    { match: "<=", token: Symbols.LessOrEq },
    { match: ">", token: Symbols.GreaterThan },
    { match: "<", token: Symbols.LessThan },
    { match: "+", token: Symbols.Plus, valueTypes: [FieldType.Double, FieldType.Integer] },
    { match: "-", token: Symbols.Minus, valueTypes: [FieldType.Double, FieldType.Integer] },
    { match: /\d+(?:\.\d*)?(?:e-?\d+)?/, token: Symbols.Digits },
    { match: /'(?:[^']|'')*'/, token: Symbols.String },
    { match: /'(?:[^']|'')*/, token: Symbols.NonterminatingString },
    { match: /"(?:[^"]|"")*"/, token: Symbols.String },
    { match: /"(?:[^"]|"")*/, token: Symbols.NonterminatingString },
    { match: /./, token: Symbols.UnexpectedToken},
];
