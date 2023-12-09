import { getUserRecs } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";



try{
    const recs = await getUserRecs("blockman57@gmail.com")
    console.log(recs)
    
}catch(e){
    console.log(e)
}




