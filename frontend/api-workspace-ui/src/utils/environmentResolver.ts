export interface EnvironmentVariable {
    id: number;
    variableKey: string;
    variableValue: string;
    environmentId?: number;
}


/**
 * Replaces {{variableName}} with the
 * corresponding environment variable value.
 */
export function resolveEnvironmentVariables(
    value: string,
    variables: EnvironmentVariable[]
): string {

    if (!value) {
        return value;
    }

    if (!variables || variables.length === 0) {
        return value;
    }


    return value.replace(
        /\{\{\s*([^{}]+?)\s*\}\}/g,
        (match, variableKey) => {

            const key =
                variableKey.trim();


            const variable =
                variables.find(
                    (variable) =>
                        variable.variableKey === key
                );


            // Variable doesn't exist
            if (!variable) {

                return match;
            }


            return variable.variableValue;
        }
    );
}

export function findUnresolvedVariables(
    value: string,
    variables: EnvironmentVariable[]
): string[] {

    if (!value) {
        return [];
    }


    const matches =
        value.match(
            /\{\{\s*([^{}]+?)\s*\}\}/g
        );


    if (!matches) {
        return [];
    }


    const availableKeys =
        new Set(
            variables.map(
                (variable) =>
                    variable.variableKey
            )
        );


    const unresolved =
        matches
            .map((match) =>
                match
                    .replace(/\{\{|\}\}/g, "")
                    .trim()
            )
            .filter(
                (key) =>
                    !availableKeys.has(key)
            );


    return [
        ...new Set(unresolved)
    ];
}