class ConfigFetcher {

    static async fetchBindingKeys(url: string) {
        try {
            const response = await fetch(url, { method: "GET" });
            const data = await response.json();
            console.log(`Binding keys fetched from ${url}`, { data });
            return data;
        } catch (error) {
            console.error(`Error fetching binding keys from ${url}`, error);
            throw new Error("Internal server error");
        }
    }

}

export default ConfigFetcher;