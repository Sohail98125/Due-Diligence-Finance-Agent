import fetchRoicData from "../../services/roic.service.js";

const roicNode = async(state)=>{
    try{
        const financialData = await fetchRoicData(state.symbol);
        return {
            rawFinanceData:financialData,
            error:null
        }
    }catch(error){
        return {
            rawFinanceData:null,
            error:error.message
        }
    }
}

export default roicNode;