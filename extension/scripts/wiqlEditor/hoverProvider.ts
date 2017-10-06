import { WorkItemField, FieldType } from "TFS/WorkItemTracking/Contracts";
import { parse, IParseResults } from "./compiler/parser";
import * as Symbols from "./compiler/symbols";
import { definedVariables } from "./wiqlDefinition";
import { allProjectWits, getWitsByProjects } from "../cachedData/workItemTypes";
import { fields } from "../cachedData/fields";
import * as Q from "q";
import { symbolsOfType, symbolsAtPosition } from "./parseAnalysis/findSymbol";
import { getFilters } from "./parseAnalysis/whereClauses";

function toRange(token: Symbols.Token) {
    return new monaco.Range(token.line + 1, token.startColumn + 1, token.line + 1, token.endColumn + 1);
}

function getFieldHover(hoverSymbols: Symbols.Symbol[], parseResult: IParseResults): Q.IPromise<monaco.languages.Hover> | undefined {
    const id = hoverSymbols.filter(s => s instanceof Symbols.Identifier)[0] as Symbols.Identifier;
    if (id) {
        return Q.all([fields.getValue(), getFilters(parseResult)]).then(([fields, filters]) => {
            const matchedField = fields.getField(id.text);
            if (matchedField) {
                const hovers: monaco.MarkedString[] = [FieldType[matchedField.type]];
                const range = toRange(id);
                // Also include description -- extensions can only get this from the work item types
                return getWitsByProjects(filters.projects, filters.workItemTypes).then(workItemTypes => {
                    const descriptionSet: { [description: string]: void } = {};
                    const descriptions: { [witName: string]: string } = {};
                    for (const wit of workItemTypes) {
                        for (const field of wit.fieldInstances) {
                            if (field.referenceName === matchedField.referenceName && field.helpText) {
                                descriptions[wit.name] = field.helpText;
                                descriptionSet[field.helpText] = void 0;
                            }
                        }
                    }
                    const descriptionArr = Object.keys(descriptionSet);
                    // Don't show the description if it differs by wit
                    if (descriptionArr.length === 1) {
                        hovers.push(descriptionArr[0]);
                    }
                    return { contents: hovers, range };
                });
            }
            return null as any;
        });
    }
}

function getVariableHover(hoverSymbols: Symbols.Symbol[], parseResult: IParseResults): monaco.languages.Hover | undefined {
    const variable = hoverSymbols.filter(s => s instanceof Symbols.Variable)[0] as Symbols.Variable;
    if (variable) {
        const matchedVariable = variable.text.toLocaleLowerCase() in definedVariables;
        if (matchedVariable) {
            const hovers: monaco.MarkedString[] = [];
            hovers.push(FieldType[definedVariables[variable.text.toLocaleLowerCase()]]);
            const range = toRange(variable);
            return { contents: hovers, range };
        }
    }
}

function getWitHover(hoverSymbols: Symbols.Symbol[], parseResult: IParseResults): Q.IPromise<monaco.languages.Hover> | undefined {
    const witExpression = hoverSymbols.filter(s =>
        s instanceof Symbols.ConditionalExpression &&
        s.field &&
        (
            s.field.identifier.text.toLocaleLowerCase() === "system.workitemtype" ||
            s.field.identifier.text.toLocaleLowerCase() === "work item type"
        )
    )[0] as Symbols.ConditionalExpression;
    const firstSymbol = hoverSymbols[0];
    if (
        firstSymbol instanceof Symbols.String &&
        witExpression
    ) {
        const witText = firstSymbol.text;
        // "Type" => Type
        const searchWit = witText.substr(1, witText.length - 2);
        return Q.all([fields.getValue(), getFilters(parseResult)]).then(([fields, filters]) =>
            getWitsByProjects(filters.projects, filters.workItemTypes).then(workItemTypes => {
                const matchingWits = workItemTypes.filter(w => w.name.toLocaleLowerCase() === searchWit.toLocaleLowerCase());
                if (matchingWits.length !== 1) {
                    return null as any;
                }
                return { contents: [matchingWits[0].description], range: toRange(firstSymbol) };
            })
        );
    }
}

export function getHoverProvider(): monaco.languages.HoverProvider {
    return {
        provideHover: (model, position, token) => {
            const lines = model.getLinesContent();

            const parseResult = parse(lines);
            const hoverSymbols = symbolsAtPosition(position.lineNumber, position.column, parseResult);

            return getFieldHover(hoverSymbols, parseResult) ||
                getVariableHover(hoverSymbols, parseResult) ||
                getWitHover(hoverSymbols, parseResult) ||
                null as any;
        }
    };
}