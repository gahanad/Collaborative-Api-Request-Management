export function validateRequestUrl(
    url: string
): string | null {

    const trimmedUrl =
        url.trim();


    if (!trimmedUrl) {

        return "Request URL is required.";

    }


    try {

        new URL(trimmedUrl);

        return null;

    } catch {

        return "Please enter a valid URL.";

    }
}

export function validateRequestName(
    name: string
): string | null {

    const trimmedName =
        name.trim();


    if (!trimmedName) {

        return "Request name is required.";

    }


    if (trimmedName.length > 100) {

        return "Request name cannot exceed 100 characters.";

    }


    return null;
}