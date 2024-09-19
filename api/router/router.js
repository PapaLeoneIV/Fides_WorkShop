//TODO move the implementation of the routes to service directory
export function setUpRoutes(app) {
    app.get("/", (req, res) => {
        res.send("Hello World");
    });
    app.get("/message", (req, res) => {
        res.send("messageList");
    });
    app.get("/message/:id", (req, res) => {
        res.send("messageDetail");
    });
    app.put("/message/:id", (req, res) => {
        res.send("messageUpdate");
    });
    app.delete("/message/:id", (req, res) => {
        res.send("messageDelete");
    });
}
