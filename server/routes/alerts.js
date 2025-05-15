import { Router } from "express";
const router = Router();
import xss from "xss";

import { createAlert } from "../data/alerts.js";
import { createBalanceAlert, getBalanceAlert } from "../data/balanceAlert.js";
import { getUser } from "../data/users.js";
import { ObjectId } from "mongodb";
import { alerts } from "../config/mongoCollections.js";
import { bills } from "../config/mongoCollections.js"

router.route("/balanceAlert").post(async (req, res) => {
  const addAlert = req.body;
  const userId = xss(addAlert.userId);
  let balance = xss(addAlert.balance).trim();
  let alertType = xss(addAlert.alertType).trim();
  let alertCollection;

  try {
    const user = await getUser(userId);
    if (user === null) {
      return res.status(404).json({ error: "No user found with provided id" });
    }
    const existingBalanceAlert = await getBalanceAlert(userId);

    if (existingBalanceAlert) {
      alertCollection = await alerts();
      await alertCollection.updateOne(
        {
          _id: new ObjectId(existingBalanceAlert.alertId),
          "alerts._id": existingBalanceAlert._id,
        },
        { $set: { "alerts.$.balance": balance } }
      );

      return res.status(200).json({ balance: balance });
    }

    const newAlert = await createAlert(userId, alertType);
    if (!newAlert) {
      return res.status(400).json({ error: "Unable to create alert" });
    }

    const balanceAlert = await createBalanceAlert(
      userId.toString(),
      newAlert._id.toString(),
      balance
    );

    if (balanceAlert) {
      return res.status(200).json({balance: balanceAlert.balance});
    } else {
      if (alertCollection) {
        await alertCollection.deleteOne({ _id: newAlert._id });
      }

      return res.status(400).json({ error: "Unable to create alert" });
    }
  } catch (e) {
    console.log(e);
    if (alertCollection) {
      await alertCollection.deleteOne({ _id: newAlert._id });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.route("/balanceAlert/:userId").get(async (req,res)=>{
  const userId=xss(req.params.userId);
  try{
    const user=await getUser(userId);
    if(!user){
      return res.status(404).json({error:"no user found with this id"});
    }
    const existingBalanceAlert=await getBalanceAlert(userId);
    if(!existingBalanceAlert){
      return res.status(404).json({error: "No balance has been set"});
    }
  return res.status(200).json(existingBalanceAlert);
}
catch(e){
return res.status(500).json({error : "internal server error"});
}
});


export default router;
