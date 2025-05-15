import { Router } from "express";
import { getUser } from "../data/users.js";
import xss from "xss";
const router = Router();
import { createBills, deleteBill, totalBills } from "../data/bills.js";
import {bills} from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkAmount, checkDueDate, checkID, checkString } from "../helpers.js";


router.route("/addBill").post(async(req,res)=>{
    const{ userId,amount,category,description, dueDate}=req.body;

    const cleanUserId=xss(userId).trim();
    const cleanAmount=parseFloat(xss(amount));
    const cleanCategory=xss(category).trim();
    const cleanDescription=xss(description || "" ).trim();
    const cleanDueDate = xss(dueDate).trim();

    try{
        checkString(cleanUserId, 'userId');
        checkID(cleanUserId, 'userId');
      } catch(e){
        return res.status(400).json({error: "Invalid User Id"});
      }
      try{
        checkAmount(cleanAmount, 'amount');
      } catch(e){
        return res.status(400).json({error: "Invalid Amount"});
      }
      try{
        checkString(cleanCategory, 'category');
      } catch(e){
        return res.status(400).json({error: "Invalid Category"});
      }
      try{
        checkDueDate(cleanDueDate);
      } catch(e){
        return res.status(400).json({error: 'Invalid Date'});
      }

try {
    const user=await getUser(cleanUserId);
    if(!user){
        return res.status(404).json({error:"User not found"});
    }
    const newBill=await createBills({
        userId:cleanUserId,
        amount:cleanAmount,
        category:cleanCategory,
        description:cleanDescription,
        createdAt:new Date(),
        dueDate: cleanDueDate
    });
    return res.status(200).json(newBill);

}   catch(e){
    console.error(e);
    return res.status(500).json({error:"Failed to add Bill"});
}
});

// router.route('/totalBills/:userId').get(async(req,res)=>{
//     const userId=req.params.userId;
//     try{
//         const billCollection=await bills();
//         const totalBillDoc=await billCollection.findOne({userId:new ObjectId(userId), isTotal:true})
//         if(totalBillDoc){
//             const monthlyBills=totalBillDoc.totalBills || 0;
//             return res.status(200).json({monthlyBills});  
//         }
//         else{
//             return res.status(404).json({error: "Total Bills not found"});
//         }
//      } catch(e){
//         console.error(e);
//         return res.status(500).json({error:"Internal server error"});

//         }
// });
router.route('/userBills/:userId').get(async(req,res)=>{
    const userId=req.params.userId;
    try{
        const billCollection=await bills();
        const userBills=await billCollection.
        find({userId:new ObjectId(userId), isTotal:{$ne: true}})
        .sort({createdAt:-1})
        .toArray();
        return res.status(200).json(userBills);
       
     } catch(e){
        console.error(e);
        return res.status(500).json({error:"Failed to fetch Bills"});

        }
});

router.route('/deleteBill/:id').delete(async (req, res) => {
    const billId = req.params.id;
    try{
        const deletedBill = await deleteBill(billId);
        return res.status(200).json({message: 'Successfully deleted bill'});
    } catch(e){
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.route('/totalBills/:userId').get(async (req, res) => {
    const userId = req.params.userId;
    try{
        if(!ObjectId.isValid(userId)){
            return res.status(400).json({error: "Invalid user ID"});
        }

        const totalAmount = await totalBills(userId);
        if(totalAmount === null){
            return res.status(400).json({error: 'Could not get total bills'});
        }
        return res.status(200).json({totalBills: totalAmount});
    } catch(e){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

export default router;
