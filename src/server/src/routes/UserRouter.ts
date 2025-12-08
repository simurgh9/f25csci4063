import { Router } from "express";

import { UserController } from "../controllers/users/UserController";
const userController = new UserController(); 

const userRouter = Router(); 

userRouter.post("/create", userController.create);
userRouter.put("/shows", userController.addShowForUser);    
userRouter.get("/subscriptionInfo", userController.getSubscriptionInfoForUser);
userRouter.post("/subscriptionInfo", userController.addCurrentEpisode);
userRouter.post("/unsubscribe", userController.unsubscribeFromShow);
userRouter.get("/:id", userController.get);
userRouter.delete("/:id", userController.delete);
userRouter.get("/posts/:userId", userController.getPostsForUser);

export default userRouter; 