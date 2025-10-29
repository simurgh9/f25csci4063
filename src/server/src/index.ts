import { app } from "./app";
import { AppDataSource } from "./model/datasource"

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    try {
        await AppDataSource.initialize();
        console.log(`Example app listening at http://localhost:${port}`)

      } catch (error) {
        console.log("An error occured during initialization: \n", error);
      }
  } 
);