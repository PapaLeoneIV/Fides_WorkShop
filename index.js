
import { db } from "./db/db.js";
import { app, UserRouter } from "./api/router/router.js"


function main() {

  app.use("/User/", UserRouter);

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

main();
