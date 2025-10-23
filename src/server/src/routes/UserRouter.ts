import { Router } from "express";

import { UserController } from "../controllers/users/UserController";
const userController = new UserController(); 

const userRouter = Router(); 

userRouter.get("/:id", userController.get);
userRouter.post("/create", userController.create);
userRouter.delete("/:id", userController.delete);
userRouter.put("/shows", userController.addShowForUser);

export default userRouter; 