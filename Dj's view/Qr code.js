// Función para llamar al endpoint /api/token y obtener el accessToken
async function fetchAccessToken() {
    console.log("hola");
    try {
        const response = await fetch("/api/token", {
            method: "GET",
            credentials: "include",  // Para enviar cookies
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el accessToken");
        }

        const data = await response.json();
        return data.accessToken;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Función para iniciar la fiesta
async function startParty(accessToken) {
    try {
        const response = await fetch("/api/startparty", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (response.status === 403) {
            console.log("hola");
            // Intenta obtener un nuevo accessToken si el anterior fue rechazado
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return startParty(newAccessToken);
            }
        }

        if (!response.ok) {
            throw new Error("No se pudo iniciar la fiesta");
        }

        const data = await response.json();
        // Haz algo con los datos, como mostrar el código QR
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// Función principal que se ejecuta al cargar la página
async function main() {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        await startParty(accessToken);
    }
}

// Ejecuta la función main cuando se carga la página
window.addEventListener("load", main);
