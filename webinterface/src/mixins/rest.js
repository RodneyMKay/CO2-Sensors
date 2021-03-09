async function handleResponse(url, response) {
    if (response.ok) {
        return await response.json();
    } else {
        response.json()
            .then(data => {
                console.log("[ERROR] Request to " + url + " returned not ok: ");
                console.log(data);
            })
            .catch(() => console.log("[ERROR] Request to " + url + " returned an error!"));
    }
}

export default {
    methods: {
        post: async (url, data = {}) => {
            const config = {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            };

            const response = await fetch(url, config);
            return await handleResponse(url, response);
        },
        get: async (url) => {
            const config = {
                method: "GET"
            };

            const response = await fetch(url, config);
            return await handleResponse(url, response);
        }
    }
}
